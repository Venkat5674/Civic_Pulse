const prisma = require('../config/db');
const { calculatePriorityScore } = require('./priorityScoringService');
const { findDuplicateCandidates } = require('./duplicateDetectionService');
const { calculateDistanceKm } = require('../utils/distanceCalculator');

async function getIssues(params = {}, currentUserId = null, requestingUser = null) {
  const {
    search = '',
    category = 'all',
    status = 'all',
    severity = 'all',
    department = 'all',
    sort = 'newest',
    page = 1,
    limit = 10,
    userId = null,
  } = params;

  const where = {};

  if (search.trim()) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { address: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (category !== 'all') {
    where.OR = [
      { categoryId: category },
      { category: { slug: category } },
      { category: { name: { contains: category, mode: 'insensitive' } } },
    ];
  }

  // Department scoping: Check if requestingUser is restricted to a department, or if department query param is passed
  if (requestingUser?.role === 'ADMIN' && requestingUser.department && requestingUser.department !== 'ALL') {
    where.assignedDepartment = { contains: requestingUser.department, mode: 'insensitive' };
  } else if (department && department !== 'all') {
    where.assignedDepartment = { contains: department, mode: 'insensitive' };
  }

  if (status !== 'all') {
    where.status = status.toUpperCase();
  }

  if (severity !== 'all') {
    where.severity = severity.toUpperCase();
  }

  if (userId) {
    where.userId = userId;
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'priority') {
    orderBy = { priorityScore: 'desc' };
  } else if (sort === 'confirmations') {
    orderBy = { confirmationsCount: 'desc' };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [total, issues] = await Promise.all([
    prisma.issue.count({ where }),
    prisma.issue.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        category: true,
        images: true,
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        confirmations: currentUserId ? { where: { userId: currentUserId } } : false,
      },
    }),
  ]);

  const formattedItems = issues.map((issue) => {
    const userConfirmed = currentUserId ? (issue.confirmations && issue.confirmations.length > 0) : false;
    return {
      id: issue.id,
      userId: issue.userId,
      userName: issue.user.name,
      userAvatar: issue.user.avatarUrl,
      categoryId: issue.categoryId,
      categoryName: issue.category.name,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      severity: issue.severity,
      priorityScore: issue.priorityScore,
      latitude: issue.latitude,
      longitude: issue.longitude,
      address: issue.address,
      images: issue.images,
      confirmationsCount: issue.confirmationsCount,
      assignedDepartment: issue.assignedDepartment,
      isLiveCapture: issue.isLiveCapture,
      capturedLatitude: issue.capturedLatitude,
      capturedLongitude: issue.capturedLongitude,
      capturedAt: issue.capturedAt,
      userConfirmed,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      resolvedAt: issue.resolvedAt,
    };
  });

  return {
    items: formattedItems,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
}

async function getIssueById(issueId, currentUserId = null) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      category: true,
      images: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      comments: {
        include: { user: { select: { id: true, name: true, role: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
      statusHistory: { orderBy: { createdAt: 'desc' } },
      confirmations: currentUserId ? { where: { userId: currentUserId } } : false,
    },
  });

  if (!issue) {
    const error = new Error('Issue report not found');
    error.statusCode = 404;
    throw error;
  }

  const userConfirmed = currentUserId ? (issue.confirmations && issue.confirmations.length > 0) : false;

  return {
    id: issue.id,
    userId: issue.userId,
    userName: issue.user.name,
    userAvatar: issue.user.avatarUrl,
    categoryId: issue.categoryId,
    categoryName: issue.category.name,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    severity: issue.severity,
    priorityScore: issue.priorityScore,
    latitude: issue.latitude,
    longitude: issue.longitude,
    address: issue.address,
    images: issue.images,
    confirmationsCount: issue.confirmationsCount,
    assignedDepartment: issue.assignedDepartment,
    isLiveCapture: issue.isLiveCapture,
    capturedLatitude: issue.capturedLatitude,
    capturedLongitude: issue.capturedLongitude,
    capturedAt: issue.capturedAt,
    userConfirmed,
    comments: issue.comments.map((c) => ({
      id: c.id,
      issueId: c.issueId,
      userId: c.userId,
      userName: c.user.name,
      userAvatar: c.user.avatarUrl,
      userRole: c.user.role,
      body: c.body,
      createdAt: c.createdAt,
    })),
    statusHistory: issue.statusHistory,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    resolvedAt: issue.resolvedAt,
  };
}

async function createIssue(issueData, currentUser) {
  let category = null;

  if (issueData.categoryId) {
    try {
      category = await prisma.category.findUnique({
        where: { id: issueData.categoryId },
      });
    } catch (e) {
      category = null;
    }

    if (!category) {
      category = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: issueData.categoryId.toLowerCase() },
            { name: { contains: issueData.categoryId, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!category && typeof issueData.categoryId === 'string' && issueData.categoryId.startsWith('cat-')) {
      const idx = Math.max(0, parseInt(issueData.categoryId.replace('cat-', ''), 10) - 1);
      const allCats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
      if (allCats && allCats.length > 0) {
        category = allCats[idx] || allCats[0];
      }
    }
  }

  if (!category) {
    category = await prisma.category.findFirst({ where: { isActive: true } }) || await prisma.category.findFirst();
  }

  if (!category) {
    const error = new Error('Invalid category selected');
    error.statusCode = 400;
    throw error;
  }

  const duplicates = await findDuplicateCandidates({
    title: issueData.title,
    description: issueData.description,
    categoryId: issueData.categoryId,
    latitude: issueData.latitude,
    longitude: issueData.longitude,
  });

  const initialPriority = calculatePriorityScore({
    severity: issueData.severity || 'MEDIUM',
    confirmationsCount: 1,
    categoryWeight: category.priorityWeight || 1.0,
    createdAt: new Date(),
  });

  const isLiveCapture = issueData.isLiveCapture === true;
  const capturedLatitude = Number(issueData.capturedLatitude);
  const capturedLongitude = Number(issueData.capturedLongitude);
  const capturedAt = new Date(issueData.capturedAt);
  const captureDistanceKm = calculateDistanceKm(
    Number(issueData.latitude),
    Number(issueData.longitude),
    capturedLatitude,
    capturedLongitude
  );

  if (!isLiveCapture || !Number.isFinite(capturedLatitude) || !Number.isFinite(capturedLongitude) ||
      Number.isNaN(capturedAt.getTime()) || captureDistanceKm > 0.1) {
    const error = new Error('Issue evidence must be captured by camera at the reported live location');
    error.statusCode = 400;
    throw error;
  }

  const invalidImage = (issueData.images || []).find((img) => {
    if (!img || img.isLiveCamera !== true || !img.imageUrl) return true;
    const imageCapturedAt = new Date(img.capturedAt);
    return !Number.isFinite(Number(img.latitude)) ||
      !Number.isFinite(Number(img.longitude)) ||
      Number.isNaN(imageCapturedAt.getTime()) ||
      calculateDistanceKm(Number(issueData.latitude), Number(issueData.longitude), Number(img.latitude), Number(img.longitude)) > 0.1;
  });
  if (invalidImage || (issueData.images || []).length === 0) {
    const error = new Error('Every issue image must be a live camera capture from the reported location');
    error.statusCode = 400;
    throw error;
  }

  const department = await prisma.department.findUnique({
    where: { name: category.department },
  });
  const assignedDepartment = category.department || 'Municipal Department';

  const imagesToCreate = (issueData.images || []).map((img) => ({
    imageUrl: typeof img === 'string' ? img : img.imageUrl,
    publicId: typeof img === 'object' && img.publicId ? img.publicId : null,
    isLiveCamera: typeof img === 'object' && img.isLiveCamera !== undefined ? Boolean(img.isLiveCamera) : true,
    latitude: typeof img === 'object' && img.latitude != null ? Number(img.latitude) : capturedLatitude,
    longitude: typeof img === 'object' && img.longitude != null ? Number(img.longitude) : capturedLongitude,
    capturedAt: typeof img === 'object' && img.capturedAt ? new Date(img.capturedAt) : capturedAt,
  }));

  const issue = await prisma.$transaction(async (tx) => {
    const created = await tx.issue.create({
      data: {
        userId: currentUser.id,
        categoryId: category.id,
        title: issueData.title,
        description: issueData.description,
        severity: issueData.severity || 'MEDIUM',
        priorityScore: initialPriority,
        latitude: Number(issueData.latitude),
        longitude: Number(issueData.longitude),
        address: issueData.address || `${issueData.latitude.toFixed(4)}, ${issueData.longitude.toFixed(4)}`,
        confirmationsCount: 1,
        isLiveCapture,
        capturedLatitude,
        capturedLongitude,
        capturedAt,
        assignedDepartment,
        departmentId: department?.id,
        images: { create: imagesToCreate },
        confirmations: { create: { userId: currentUser.id } },
        statusHistory: {
          create: {
            oldStatus: null,
            newStatus: 'OPEN',
            changedBy: currentUser.name || 'Citizen User',
            note: 'Report submitted by citizen.',
          },
        },
      },
      include: {
        category: true,
        images: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (duplicates.length > 0) {
      await Promise.all(
        duplicates.slice(0, 3).map((candidate) =>
          tx.issueDuplicate.create({
            data: {
              issueId: created.id,
              candidateIssueId: candidate.candidateIssue.id,
              similarityScore: candidate.totalScore,
              relationType: 'POTENTIAL_DUPLICATE',
            },
          })
        )
      );
    }

    return created;
  });

  return {
    ...issue,
    categoryName: category.name,
    userConfirmed: true,
    duplicateCandidates: duplicates,
  };
}

async function confirmIssue(issueId, currentUser) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { category: true },
  });

  if (!issue) {
    const error = new Error('Issue report not found');
    error.statusCode = 404;
    throw error;
  }

  const existingConfirmation = await prisma.issueConfirmation.findUnique({
    where: {
      issueId_userId: {
        issueId,
        userId: currentUser.id,
      },
    },
  });

  if (existingConfirmation) {
    return { ...issue, userConfirmed: true };
  }

  const newCount = issue.confirmationsCount + 1;
  const newPriorityScore = calculatePriorityScore({
    severity: issue.severity,
    confirmationsCount: newCount,
    categoryWeight: issue.category ? issue.category.priorityWeight : 1.0,
    createdAt: issue.createdAt,
  });

  const updatedIssue = await prisma.$transaction(async (tx) => {
    await tx.issueConfirmation.create({
      data: {
        issueId,
        userId: currentUser.id,
      },
    });

    return tx.issue.update({
      where: { id: issueId },
      data: {
        confirmationsCount: newCount,
        priorityScore: newPriorityScore,
      },
      include: { category: true, images: true },
    });
  });

  return { ...updatedIssue, userConfirmed: true };
}

async function unconfirmIssue(issueId, currentUser) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { category: true },
  });

  if (!issue) {
    const error = new Error('Issue report not found');
    error.statusCode = 404;
    throw error;
  }

  const existingConfirmation = await prisma.issueConfirmation.findUnique({
    where: {
      issueId_userId: {
        issueId,
        userId: currentUser.id,
      },
    },
  });

  if (!existingConfirmation) {
    return { ...issue, userConfirmed: false };
  }

  const newCount = Math.max(0, issue.confirmationsCount - 1);
  const newPriorityScore = calculatePriorityScore({
    severity: issue.severity,
    confirmationsCount: newCount,
    categoryWeight: issue.category ? issue.category.priorityWeight : 1.0,
    createdAt: issue.createdAt,
  });

  const updatedIssue = await prisma.$transaction(async (tx) => {
    await tx.issueConfirmation.delete({
      where: {
        issueId_userId: {
          issueId,
          userId: currentUser.id,
        },
      },
    });

    return tx.issue.update({
      where: { id: issueId },
      data: {
        confirmationsCount: newCount,
        priorityScore: newPriorityScore,
      },
      include: { category: true, images: true },
    });
  });

  return { ...updatedIssue, userConfirmed: false };
}

async function addComment(issueId, body, currentUser) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) {
    const error = new Error('Issue report not found');
    error.statusCode = 404;
    throw error;
  }

  const comment = await prisma.comment.create({
    data: {
      issueId,
      userId: currentUser.id,
      body,
    },
    include: {
      user: { select: { id: true, name: true, role: true, avatarUrl: true } },
    },
  });

  return {
    id: comment.id,
    issueId: comment.issueId,
    userId: comment.userId,
    userName: comment.user.name,
    userAvatar: comment.user.avatarUrl,
    userRole: comment.user.role,
    body: comment.body,
    createdAt: comment.createdAt,
  };
}

async function getNearbyIssues(lat, lng, radiusKm = 2.0) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  const issues = await prisma.issue.findMany({
    where: {
      status: { notIn: ['RESOLVED', 'REJECTED'] },
    },
    include: { category: true, images: true },
  });

  return issues.filter((issue) => {
    const dist = calculateDistanceKm(latitude, longitude, issue.latitude, issue.longitude);
    return dist <= radiusKm;
  });
}

async function updateIssue(issueId, updateData, currentUser) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { category: true, images: true, user: true },
  });

  if (!issue) {
    const error = new Error('Issue report not found');
    error.statusCode = 404;
    throw error;
  }

  if (issue.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
    const error = new Error('Unauthorized to modify this issue report');
    error.statusCode = 403;
    throw error;
  }

  let newPriorityScore = issue.priorityScore;
  if (updateData.severity || updateData.status) {
    newPriorityScore = calculatePriorityScore({
      severity: updateData.severity || issue.severity,
      confirmationsCount: issue.confirmationsCount,
      categoryWeight: issue.category?.priorityWeight || 1.0,
      createdAt: issue.createdAt,
    });
  }

  const dataToUpdate = {
    ...(updateData.title && { title: updateData.title }),
    ...(updateData.description && { description: updateData.description }),
    ...(updateData.categoryId && { categoryId: updateData.categoryId }),
    ...(updateData.severity && { severity: updateData.severity }),
    ...(updateData.status && { status: updateData.status }),
    ...(updateData.latitude && { latitude: Number(updateData.latitude) }),
    ...(updateData.longitude && { longitude: Number(updateData.longitude) }),
    ...(updateData.address && { address: updateData.address }),
    priorityScore: newPriorityScore,
  };

  const updated = await prisma.issue.update({
    where: { id: issueId },
    data: dataToUpdate,
    include: { category: true, images: true, user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return updated;
}

async function deleteIssue(issueId, currentUser) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });

  if (!issue) {
    const error = new Error('Issue report not found');
    error.statusCode = 404;
    throw error;
  }

  if (issue.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
    const error = new Error('Unauthorized to delete this issue report');
    error.statusCode = 403;
    throw error;
  }

  await prisma.issue.delete({ where: { id: issueId } });
  return { message: 'Issue report deleted successfully', id: issueId };
}

async function cancelIssue(issueId, reason = 'Withdrawn by citizen', currentUser) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { category: true, images: true, user: true },
  });

  if (!issue) {
    const error = new Error('Issue report not found');
    error.statusCode = 404;
    throw error;
  }

  // Only the creator or admin can cancel/withdraw
  if (issue.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
    const error = new Error('You are not authorized to withdraw this issue report');
    error.statusCode = 403;
    throw error;
  }

  if (issue.status === 'RESOLVED') {
    const error = new Error('Cannot cancel an issue that has already been resolved by municipal authorities');
    error.statusCode = 400;
    throw error;
  }

  const oldStatus = issue.status;
  const newStatus = 'CANCELLED';

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.issue.update({
      where: { id: issueId },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            oldStatus,
            newStatus,
            changedBy: currentUser.name || 'Citizen',
            note: reason || 'Report withdrawn by reporting citizen',
          },
        },
      },
      include: {
        category: true,
        images: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: currentUser.id,
        action: 'CANCEL_ISSUE_REPORT',
        entityType: 'ISSUE',
        entityId: issueId,
        metadataJson: JSON.stringify({ oldStatus, newStatus, reason }),
      },
    });

    return res;
  });

  return updated;
}

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  cancelIssue,
  confirmIssue,
  unconfirmIssue,
  addComment,
  getNearbyIssues,
};
