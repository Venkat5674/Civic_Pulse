import { apiClient, mockDB } from './api';

export const adminService = {
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/admin/dashboard');
      if (response.data) return response.data;
    } catch (err) {
      // Fallback to local mock calculate
    }

    const issues = mockDB.getIssues();
    const categories = mockDB.getCategories();
    const users = mockDB.getUsers();

    const openCount = issues.filter((i) => i.status === 'OPEN').length;
    const underReviewCount = issues.filter((i) => i.status === 'UNDER_REVIEW').length;
    const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
    const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;
    const rejectedCount = issues.filter((i) => i.status === 'REJECTED').length;

    // Category distribution
    const categoryDistribution = categories.map((cat) => ({
      name: cat.name,
      count: issues.filter((i) => i.categoryId === cat.id).length,
    }));

    // Monthly trend mock
    const trendData = [
      { month: 'Apr', Open: 12, Resolved: 10 },
      { month: 'May', Open: 18, Resolved: 15 },
      { month: 'Jun', Open: 24, Resolved: 20 },
      { month: 'Jul', Open: 30, Resolved: 25 },
      { month: 'Aug', Open: 28, Resolved: 24 },
      { month: 'Sep', Open: issues.length, Resolved: resolvedCount },
    ];

    const priorityQueue = issues
      .filter((i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED')
      .sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      totalIssues: issues.length,
      openCount,
      underReviewCount,
      inProgressCount,
      resolvedCount,
      rejectedCount,
      totalUsers: users.length,
      avgResolutionHours: 36,
      categoryDistribution,
      trendData,
      priorityQueue,
    };
  },

  async updateIssueStatus(issueId, newStatus, note = '', adminUser) {
    try {
      const response = await apiClient.patch(`/admin/issues/${issueId}/status`, { status: newStatus, note });
      if (response.data) return response.data;
    } catch (err) {
      // Fallback
    }

    const issues = mockDB.getIssues();
    const index = issues.findIndex((i) => i.id === issueId);
    if (index === -1) throw new Error('Issue not found');

    const issue = issues[index];
    const oldStatus = issue.status;

    const historyItem = {
      id: `hist-${Date.now()}`,
      oldStatus,
      newStatus,
      changedBy: adminUser?.name || 'City Admin',
      note: note || `Status updated to ${newStatus}`,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...issue,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : issue.resolvedAt,
      statusHistory: [historyItem, ...(issue.statusHistory || [])],
    };

    issues[index] = updated;
    mockDB.setIssues(issues);

    // Audit log entry
    const auditLogs = mockDB.getAuditLogs();
    mockDB.setAuditLogs([
      {
        id: `audit-${Date.now()}`,
        actorUserId: adminUser?.id || 'usr-2',
        actorName: adminUser?.name || 'City Admin',
        action: 'UPDATE_ISSUE_STATUS',
        entityType: 'ISSUE',
        entityId: issueId,
        metadata: { oldStatus, newStatus, note },
        createdAt: new Date().toISOString(),
      },
      ...auditLogs,
    ]);

    // Send notification to owner
    const notifications = mockDB.getNotifications();
    mockDB.setNotifications([
      {
        id: `notif-${Date.now()}`,
        userId: issue.userId,
        issueId: issue.id,
        type: 'STATUS_CHANGE',
        title: 'Status Update Notification',
        message: `Your reported issue "${issue.title.slice(0, 40)}..." status changed to ${newStatus}.`,
        readAt: null,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);

    return updated;
  },

  async updateIssuePriority(issueId, newScore, note = '', adminUser) {
    const issues = mockDB.getIssues();
    const index = issues.findIndex((i) => i.id === issueId);
    if (index === -1) throw new Error('Issue not found');

    const issue = issues[index];
    const oldScore = issue.priorityScore;

    const updated = {
      ...issue,
      priorityScore: Number(newScore),
      updatedAt: new Date().toISOString(),
    };

    issues[index] = updated;
    mockDB.setIssues(issues);

    // Audit Log
    const auditLogs = mockDB.getAuditLogs();
    mockDB.setAuditLogs([
      {
        id: `audit-${Date.now()}`,
        actorUserId: adminUser?.id || 'usr-2',
        actorName: adminUser?.name || 'City Admin',
        action: 'UPDATE_ISSUE_PRIORITY',
        entityType: 'ISSUE',
        entityId: issueId,
        metadata: { oldScore, newScore, note },
        createdAt: new Date().toISOString(),
      },
      ...auditLogs,
    ]);

    return updated;
  },

  async mergeDuplicateIssues(primaryIssueId, duplicateIssueId, note = '', adminUser) {
    const issues = mockDB.getIssues();
    const primary = issues.find((i) => i.id === primaryIssueId);
    const duplicate = issues.find((i) => i.id === duplicateIssueId);

    if (!primary || !duplicate) throw new Error('Selected primary or duplicate issue not found');

    // Merge confirmations and mark duplicate as REJECTED with note
    const updatedDuplicate = {
      ...duplicate,
      status: 'REJECTED',
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          oldStatus: duplicate.status,
          newStatus: 'REJECTED',
          changedBy: adminUser?.name || 'City Admin',
          note: `Merged into primary issue #${primaryIssueId}. ${note}`,
          createdAt: new Date().toISOString(),
        },
        ...(duplicate.statusHistory || []),
      ],
    };

    const updatedPrimary = {
      ...primary,
      confirmationsCount: primary.confirmationsCount + duplicate.confirmationsCount,
      updatedAt: new Date().toISOString(),
    };

    const nextIssues = issues.map((i) => {
      if (i.id === primaryIssueId) return updatedPrimary;
      if (i.id === duplicateIssueId) return updatedDuplicate;
      return i;
    });

    mockDB.setIssues(nextIssues);
    return { primary: updatedPrimary, duplicate: updatedDuplicate };
  },

  async getCategories() {
    return mockDB.getCategories();
  },

  async addCategory(data) {
    const categories = mockDB.getCategories();
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      icon: data.icon || 'HelpCircle',
      priorityWeight: Number(data.priorityWeight) || 1.0,
      isActive: true,
    };
    mockDB.setCategories([...categories, newCategory]);
    return newCategory;
  },

  async updateCategory(id, updates) {
    const categories = mockDB.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    categories[index] = { ...categories[index], ...updates };
    mockDB.setCategories(categories);
    return categories[index];
  },

  async getUsers() {
    return mockDB.getUsers();
  },

  async updateUserRole(userId, newRole) {
    const users = mockDB.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], role: newRole };
    mockDB.setUsers(users);
    return users[index];
  }
};
