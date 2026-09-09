import { apiClient, mockDB } from './api';
import { calculatePriorityScore } from './priorityScoringService';
import { calculateDistanceKm } from './duplicateDetectionService';

export const issueService = {
  async getIssues(params = {}) {
    const {
      search = '',
      category = 'all',
      status = 'all',
      severity = 'all',
      sort = 'newest', // 'newest', 'priority', 'confirmations'
      page = 1,
      limit = 10,
    } = params;

    try {
      const response = await apiClient.get('/issues', { params });
      if (response.data && response.data.items) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend API unavailable, using Standalone Mock DB for issue list:', err.message);
    }

    // Mock filtering & sorting
    let list = mockDB.getIssues();

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q)
      );
    }

    if (category !== 'all') {
      list = list.filter((item) => item.categoryId === category || item.categoryName.toLowerCase().includes(category.toLowerCase()));
    }

    if (status !== 'all') {
      list = list.filter((item) => item.status === status);
    }

    if (severity !== 'all') {
      list = list.filter((item) => item.severity === severity);
    }

    // Sort
    list.sort((a, b) => {
      if (sort === 'priority') return b.priorityScore - a.priorityScore;
      if (sort === 'confirmations') return b.confirmationsCount - a.confirmationsCount;
      // Default newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Pagination
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = list.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    };
  },

  async getIssueById(id) {
    try {
      const response = await apiClient.get(`/issues/${id}`);
      if (response.data) return response.data;
    } catch (err) {
      // Fallback
    }

    const issues = mockDB.getIssues();
    const issue = issues.find((i) => i.id === id);
    if (!issue) throw new Error('Issue report not found');

    const comments = mockDB.getComments().filter((c) => c.issueId === id);
    return { ...issue, comments };
  },

  async createIssue(issueData, currentUser) {
    try {
      const response = await apiClient.post('/issues', issueData);
      if (response.data) return response.data;
    } catch (err) {
      console.warn('Backend API error on create issue, falling back to local DB:', err.message);
    }

    const categories = mockDB.getCategories();
    const categoryObj = categories.find((c) => c.id === issueData.categoryId) || categories[0];

    const initialPriority = calculatePriorityScore({
      severity: issueData.severity || 'MEDIUM',
      confirmationsCount: 1,
      categoryWeight: categoryObj?.priorityWeight || 1.0,
      createdAt: new Date().toISOString(),
    });

    const newIssue = {
      id: `iss-${Date.now()}`,
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'Jane Citizen',
      userAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      categoryId: categoryObj?.id || 'cat-1',
      categoryName: categoryObj?.name || 'Roads & Potholes',
      title: issueData.title,
      description: issueData.description,
      status: 'OPEN',
      severity: issueData.severity || 'MEDIUM',
      priorityScore: initialPriority,
      latitude: Number(issueData.latitude),
      longitude: Number(issueData.longitude),
      address: issueData.address || `${issueData.latitude.toFixed(4)}, ${issueData.longitude.toFixed(4)}, Metro City`,
      images: (issueData.images || []).map((imgUrl, index) => ({
        id: `img-${Date.now()}-${index}`,
        imageUrl: typeof imgUrl === 'string' ? imgUrl : URL.createObjectURL(imgUrl),
        publicId: `upload_${Date.now()}_${index}`,
      })),
      confirmationsCount: 1,
      userConfirmed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          oldStatus: null,
          newStatus: 'OPEN',
          changedBy: currentUser?.name || 'Citizen User',
          note: 'Report submitted by citizen.',
          createdAt: new Date().toISOString(),
        }
      ]
    };

    const currentIssues = mockDB.getIssues();
    mockDB.setIssues([newIssue, ...currentIssues]);

    return newIssue;
  },

  async confirmIssue(issueId, currentUser) {
    try {
      const response = await apiClient.post(`/issues/${issueId}/confirm`);
      if (response.data) return response.data;
    } catch (err) {
      // Fallback
    }

    const issues = mockDB.getIssues();
    const index = issues.findIndex((i) => i.id === issueId);
    if (index === -1) throw new Error('Issue not found');

    const issue = issues[index];
    if (issue.userConfirmed) {
      return issue; // Already confirmed
    }

    const updated = {
      ...issue,
      confirmationsCount: issue.confirmationsCount + 1,
      userConfirmed: true,
      priorityScore: calculatePriorityScore({
        severity: issue.severity,
        confirmationsCount: issue.confirmationsCount + 1,
        categoryWeight: 1.2,
        createdAt: issue.createdAt,
      })
    };

    issues[index] = updated;
    mockDB.setIssues(issues);
    return updated;
  },

  async unconfirmIssue(issueId, currentUser) {
    try {
      await apiClient.delete(`/issues/${issueId}/confirm`);
    } catch (err) {
      // Fallback
    }

    const issues = mockDB.getIssues();
    const index = issues.findIndex((i) => i.id === issueId);
    if (index === -1) throw new Error('Issue not found');

    const issue = issues[index];
    if (!issue.userConfirmed) return issue;

    const updated = {
      ...issue,
      confirmationsCount: Math.max(0, issue.confirmationsCount - 1),
      userConfirmed: false,
    };

    issues[index] = updated;
    mockDB.setIssues(issues);
    return updated;
  },

  async addComment(issueId, body, currentUser) {
    try {
      const response = await apiClient.post(`/issues/${issueId}/comments`, { body });
      if (response.data) return response.data;
    } catch (err) {
      // Fallback
    }

    const newComment = {
      id: `cmt-${Date.now()}`,
      issueId,
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'Jane Citizen',
      userAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      userRole: currentUser?.role || 'CITIZEN',
      body,
      createdAt: new Date().toISOString(),
    };

    const comments = mockDB.getComments();
    mockDB.setComments([...comments, newComment]);
    return newComment;
  },

  async getNearbyIssues(lat, lng, radiusKm = 2.0) {
    const issues = mockDB.getIssues();
    return issues.filter((i) => {
      const dist = calculateDistanceKm(lat, lng, i.latitude, i.longitude);
      return dist <= radiusKm;
    });
  }
};
