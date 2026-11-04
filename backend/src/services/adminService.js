const prisma = require('../config/db');
const emailService = require('./emailService');
const logger = require('../config/logger');

function assertDepartmentAccess(issue, adminUser) {
  if (
    adminUser?.role === 'ADMIN' &&
    adminUser.department &&
    adminUser.department !== 'ALL' &&
    issue.assignedDepartment?.toLowerCase() !== adminUser.department.toLowerCase()
  ) {
    const error = new Error('This issue is assigned to another department');
    error.statusCode = 403;
    throw error;
  }
}

async function getDashboardStats(adminUser = null) {
  const isDeptAdmin = adminUser?.role === 'ADMIN' && adminUser.department && adminUser.department !== 'ALL';
  const issueFilter = isDeptAdmin
    ? { assignedDepartment: { contains: adminUser.department, mode: 'insensitive' } }
    : {};

  const [
    totalIssues,
    openCount,
    underReviewCount,
    inProgressCount,
    resolvedCount,
    rejectedCount,
    totalUsers,
    categories,
    issues,
  ] = await Promise.all([
    prisma.issue.count({ where: issueFilter }),
    prisma.issue.count({ where: { ...issueFilter, status: 'OPEN' } }),
    prisma.issue.count({ where: { ...issueFilter, status: 'UNDER_REVIEW' } }),
    prisma.issue.count({ where: { ...issueFilter, status: 'IN_PROGRESS' } }),
    prisma.issue.count({ where: { ...issueFilter, status: 'RESOLVED' } }),
    prisma.issue.count({ where: { ...issueFilter, status: 'REJECTED' } }),
    prisma.user.count(),
    prisma.category.findMany(),
    prisma.issue.findMany({
      where: issueFilter,
      select: { categoryId: true, status: true, priorityScore: true, id: true, title: true, severity: true, assignedDepartment: true, createdAt: true },
    }),
  ]);

  // Category distribution
  const categoryDistribution = categories.map((cat) => ({
    name: cat.name,
    count: issues.filter((i) => i.categoryId === cat.id).length,
  }));

  // Trend data mock generator
  const trendData = [
    { month: 'Apr', Open: Math.round(issues.length * 0.4), Resolved: Math.round(resolvedCount * 0.3) },
    { month: 'May', Open: Math.round(issues.length * 0.6), Resolved: Math.round(resolvedCount * 0.5) },
    { month: 'Jun', Open: Math.round(issues.length * 0.7), Resolved: Math.round(resolvedCount * 0.6) },
    { month: 'Jul', Open: Math.round(issues.length * 0.85), Resolved: Math.round(resolvedCount * 0.8) },
    { month: 'Aug', Open: Math.round(issues.length * 0.9), Resolved: Math.round(resolvedCount * 0.9) },
    { month: 'Sep', Open: issues.length, Resolved: resolvedCount },
  ];

  const priorityQueue = issues
    .filter((i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED')
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    totalIssues,
    openCount,
    underReviewCount,
    inProgressCount,
    resolvedCount,
    rejectedCount,
    totalUsers,
    avgResolutionHours: 36,
    department: isDeptAdmin ? adminUser.department : 'ALL',
    categoryDistribution,
    trendData,
    priorityQueue,
  };
}

async function updateIssueStatus(issueId, newStatus, note = '', adminUser) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { user: true, category: true },
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }
  assertDepartmentAccess(issue, adminUser);

  const oldStatus = issue.status;
  const normalizedNewStatus = newStatus.toUpperCase();

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.issue.update({
      where: { id: issueId },
      data: {
        status: normalizedNewStatus,
        resolvedAt: normalizedNewStatus === 'RESOLVED' ? new Date() : issue.resolvedAt,
        statusHistory: {
          create: {
            oldStatus,
            newStatus: normalizedNewStatus,
            changedBy: adminUser?.name || 'City Admin',
            note: note || `Status updated to ${newStatus}`,
          },
        },
      },
      include: {
        category: true,
        images: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Write audit log
    await tx.auditLog.create({
      data: {
        actorUserId: adminUser.id,
        action: 'UPDATE_ISSUE_STATUS',
        entityType: 'ISSUE',
        entityId: issueId,
        metadataJson: JSON.stringify({ oldStatus, newStatus: normalizedNewStatus, note }),
      },
    });

    // Create notification for issue owner
    await tx.notification.create({
      data: {
        userId: issue.userId,
        issueId: issue.id,
        type: 'STATUS_CHANGE',
        title: 'Status Update Notification',
        message: `Your reported issue "${issue.title.slice(0, 40)}..." status changed to ${normalizedNewStatus}.`,
      },
    });

    return res;
  });

  // Asynchronously dispatch email notification if issue is SOLVED (RESOLVED) or REJECTED
  if (issue.user?.email && issue.user.emailNotifications !== false) {
    if (normalizedNewStatus === 'RESOLVED') {
      emailService.sendIssueResolvedEmail({
        to: issue.user.email,
        userName: issue.user.name,
        issue: { ...issue, category: updated.category || issue.category },
        note,
      }).catch((emailErr) => {
        logger.warn(`Failed to dispatch issue resolved email to ${issue.user.email}: ${emailErr.message}`);
      });
    } else if (normalizedNewStatus === 'REJECTED') {
      emailService.sendIssueRejectedEmail({
        to: issue.user.email,
        userName: issue.user.name,
        issue: { ...issue, category: updated.category || issue.category },
        note,
      }).catch((emailErr) => {
        logger.warn(`Failed to dispatch issue rejected email to ${issue.user.email}: ${emailErr.message}`);
      });
    }
  }

  return updated;
}

async function updateIssuePriority(issueId, newScore, note = '', adminUser) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }
  assertDepartmentAccess(issue, adminUser);

  const oldScore = issue.priorityScore;

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.issue.update({
      where: { id: issueId },
      data: { priorityScore: Number(newScore) },
      include: { category: true, images: true },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: adminUser.id,
        action: 'UPDATE_ISSUE_PRIORITY',
        entityType: 'ISSUE',
        entityId: issueId,
        metadataJson: JSON.stringify({ oldScore, newScore, note }),
      },
    });

    return res;
  });

  return updated;
}

async function mergeDuplicateIssues(primaryIssueId, duplicateIssueId, note = '', adminUser) {
  const primary = await prisma.issue.findUnique({ where: { id: primaryIssueId } });
  const duplicate = await prisma.issue.findUnique({
    where: { id: duplicateIssueId },
    include: { user: true, category: true },
  });

  if (!primary || !duplicate) {
    const error = new Error('Primary or duplicate issue report not found');
    error.statusCode = 404;
    throw error;
  }
  assertDepartmentAccess(primary, adminUser);
  assertDepartmentAccess(duplicate, adminUser);

  const result = await prisma.$transaction(async (tx) => {
    // Mark duplicate as REJECTED
    const updatedDuplicate = await tx.issue.update({
      where: { id: duplicateIssueId },
      data: {
        status: 'REJECTED',
        statusHistory: {
          create: {
            oldStatus: duplicate.status,
            newStatus: 'REJECTED',
            changedBy: adminUser.name || 'City Admin',
            note: `Merged into primary issue #${primaryIssueId}. ${note}`,
          },
        },
      },
    });

    // Transfer confirmations
    const updatedPrimary = await tx.issue.update({
      where: { id: primaryIssueId },
      data: {
        confirmationsCount: primary.confirmationsCount + duplicate.confirmationsCount,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: adminUser.id,
        action: 'MERGE_DUPLICATE_ISSUE',
        entityType: 'ISSUE',
        entityId: primaryIssueId,
        metadataJson: JSON.stringify({ primaryIssueId, duplicateIssueId, note }),
      },
    });

    return { primary: updatedPrimary, duplicate: updatedDuplicate };
  });

  // Asynchronously dispatch duplicate rejection notice email
  if (duplicate.user?.email) {
    emailService.sendIssueRejectedEmail({
      to: duplicate.user.email,
      userName: duplicate.user.name,
      issue: duplicate,
      note: `This issue report was marked as a duplicate and merged into primary report #${primaryIssueId}. Community confirmations have been transferred. ${note}`,
    }).catch((emailErr) => {
      logger.warn(`Failed to dispatch duplicate merged email to ${duplicate.user.email}: ${emailErr.message}`);
    });
  }

  return result;
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

async function createCategory(data) {
  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');
  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      icon: data.icon || 'HelpCircle',
      department: data.department || 'Municipal Department',
      priorityWeight: Number(data.priorityWeight) || 1.0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

async function updateCategory(id, updates) {
  return prisma.category.update({
    where: { id },
    data: updates,
  });
}

async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      avatarUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function updateUserRole(userId, newRole, newDepartment) {
  const data = {};
  if (newRole) data.role = newRole.toUpperCase();
  if (newDepartment !== undefined) data.department = newDepartment;

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
}

async function deleteCategory(id) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const issueCount = await prisma.issue.count({ where: { categoryId: id } });
  if (issueCount > 0) {
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  return prisma.category.delete({ where: { id } });
}

async function getAdminAnalytics(adminUser = null) {
  const isDeptAdmin = adminUser?.role === 'ADMIN' && adminUser.department && adminUser.department !== 'ALL';
  const issueFilter = isDeptAdmin
    ? { assignedDepartment: { contains: adminUser.department, mode: 'insensitive' } }
    : {};

  const [
    totalIssues,
    totalUsers,
    totalCategories,
    openIssues,
    inProgressIssues,
    resolvedIssues,
    rejectedIssues,
    categories,
    issues,
  ] = await Promise.all([
    prisma.issue.count({ where: issueFilter }),
    prisma.user.count(),
    prisma.category.count(),
    prisma.issue.count({ where: { ...issueFilter, status: 'OPEN' } }),
    prisma.issue.count({ where: { ...issueFilter, status: 'IN_PROGRESS' } }),
    prisma.issue.count({ where: { ...issueFilter, status: 'RESOLVED' } }),
    prisma.issue.count({ where: { ...issueFilter, status: 'REJECTED' } }),
    prisma.category.findMany(),
    prisma.issue.findMany({
      where: issueFilter,
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        priorityScore: true,
        categoryId: true,
        assignedDepartment: true,
        createdAt: true,
        resolvedAt: true,
      },
    }),
  ]);

  const severityBreakdown = {
    LOW: issues.filter((i) => i.severity === 'LOW').length,
    MEDIUM: issues.filter((i) => i.severity === 'MEDIUM').length,
    HIGH: issues.filter((i) => i.severity === 'HIGH').length,
    CRITICAL: issues.filter((i) => i.severity === 'CRITICAL').length,
  };

  const categoryAnalytics = categories.map((cat) => {
    const catIssues = issues.filter((i) => i.categoryId === cat.id);
    return {
      id: cat.id,
      name: cat.name,
      total: catIssues.length,
      open: catIssues.filter((i) => i.status === 'OPEN').length,
      resolved: catIssues.filter((i) => i.status === 'RESOLVED').length,
    };
  });

  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;

  return {
    kpis: {
      totalIssues,
      totalUsers,
      totalCategories,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      rejectedIssues,
      resolutionRate: `${resolutionRate}%`,
      avgResolutionHours: 24,
    },
    severityBreakdown,
    categoryAnalytics,
    monthlyTrends: [
      { month: 'Apr', Reported: 14, Resolved: 12 },
      { month: 'May', Reported: 22, Resolved: 18 },
      { month: 'Jun', Reported: 31, Resolved: 26 },
      { month: 'Jul', Reported: 38, Resolved: 32 },
      { month: 'Aug', Reported: 45, Resolved: 40 },
      { month: 'Sep', Reported: totalIssues, Resolved: resolvedIssues },
    ],
  };
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

async function exportIssuesCSV(query = {}) {
  const { status, categoryId } = query;
  const where = {};
  if (status && status !== 'all') {
    where.status = status;
  }
  if (categoryId && categoryId !== 'all') {
    where.categoryId = categoryId;
  }

  const issues = await prisma.issue.findMany({
    where,
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const headers = [
    'Issue ID',
    'Title',
    'Category',
    'Status',
    'Severity',
    'Priority Score',
    'Confirmations',
    'Reported By',
    'Reporter Email',
    'Address',
    'Latitude',
    'Longitude',
    'Created At',
    'Resolved At',
  ];

  const rows = issues.map((i) => [
    i.id,
    i.title,
    i.category ? i.category.name : '',
    i.status,
    i.severity,
    i.priorityScore,
    i.confirmationsCount,
    i.user ? i.user.name : '',
    i.user ? i.user.email : '',
    i.address || '',
    i.latitude,
    i.longitude,
    i.createdAt ? i.createdAt.toISOString() : '',
    i.resolvedAt ? i.resolvedAt.toISOString() : '',
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  return csvContent;
}

const DEFAULT_SETTINGS = {
  portalName: 'Metro City CivicPulse Platform',
  supportEmail: 'support@civicpulse.org',
  duplicateRadiusKm: '2.0',
  slaEscalationHours: '48',
  enableSocketBroadcasts: true,
  enableEmailAlerts: true,
  autoAssignCritical: true,
  jwtExpiryDays: '7',
  rateLimitPerMin: '100',
};

async function getAuditLogs(limit = 20) {
  const logs = await prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      actorUser: {
        select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    actorUser: log.actorUser,
    details: log.metadataJson ? (() => { try { return JSON.parse(log.metadataJson); } catch { return log.metadataJson; } })() : null,
    createdAt: log.createdAt,
  }));
}

async function getSystemSettings() {
  const records = await prisma.systemSetting.findMany();
  const settings = { ...DEFAULT_SETTINGS };
  for (const r of records) {
    try {
      settings[r.key] = JSON.parse(r.value);
    } catch {
      settings[r.key] = r.value;
    }
  }
  return settings;
}

async function updateSystemSettings(newSettings, actorUser) {
  const operations = Object.entries(newSettings).map(([key, val]) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(val) },
      create: { key, value: JSON.stringify(val) },
    })
  );

  await prisma.$transaction(operations);

  if (actorUser?.id) {
    await prisma.auditLog.create({
      data: {
        actorUserId: actorUser.id,
        action: 'UPDATE_SYSTEM_SETTINGS',
        entityType: 'SYSTEM_SETTINGS',
        entityId: 'global',
        metadataJson: JSON.stringify({ keys: Object.keys(newSettings) }),
      },
    });
  }

  return getSystemSettings();
}

async function assignDepartment(issueId, department, note, actorUser) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }
  assertDepartmentAccess(issue, actorUser);

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.issue.update({
      where: { id: issueId },
      data: {
        assignedDepartment: department,
      },
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        images: true,
      },
    });

    await tx.issueStatusHistory.create({
      data: {
        issueId,
        oldStatus: issue.status,
        newStatus: issue.status,
        changedBy: actorUser ? actorUser.id : 'SYSTEM',
        note: `Department assigned: ${department}${note ? ` (${note})` : ''}`,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actorUser ? actorUser.id : issue.userId,
        action: 'ASSIGN_DEPARTMENT',
        entityType: 'ISSUE',
        entityId: issueId,
        metadataJson: JSON.stringify({ department, note }),
      },
    });

    return res;
  });

  return updated;
}

module.exports = {
  getDashboardStats,
  updateIssueStatus,
  updateIssuePriority,
  mergeDuplicateIssues,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUsers,
  updateUserRole,
  getAdminAnalytics,
  exportIssuesCSV,
  getAuditLogs,
  getSystemSettings,
  updateSystemSettings,
  assignDepartment,
};
