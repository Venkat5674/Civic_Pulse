const adminService = require('../services/adminService');
const issueService = require('../services/issueService');
const { sendSuccess } = require('../utils/apiResponse');

async function getDashboardStats(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats(req.user);
    return res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

async function getAdminIssues(req, res, next) {
  try {
    const result = await issueService.getIssues(req.query, req.user?.id, req.user);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getAdminIssueReview(req, res, next) {
  try {
    const issue = await issueService.getIssueById(req.params.id);
    if (
      req.user?.department &&
      req.user.department !== 'ALL' &&
      issue.assignedDepartment?.toLowerCase() !== req.user.department.toLowerCase()
    ) {
      const error = new Error('This issue is assigned to another department');
      error.statusCode = 403;
      throw error;
    }
    const duplicates = await require('../services/duplicateDetectionService').findDuplicateCandidates(issue, issue.id);
    return res.status(200).json({ issue, duplicates });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, note } = req.body;
    const updated = await adminService.updateIssueStatus(req.params.id, status, note, req.user);
    
    // Emit socket event if io is available
    if (req.app.get('io')) {
      req.app.get('io').emit('status_updated', {
        issueId: req.params.id,
        status,
        note,
      });
    }

    return sendSuccess(res, updated, 'Issue status updated successfully');
  } catch (err) {
    next(err);
  }
}

async function updatePriority(req, res, next) {
  try {
    const { priorityScore, note } = req.body;
    const updated = await adminService.updateIssuePriority(req.params.id, priorityScore, note, req.user);
    return sendSuccess(res, updated, 'Issue priority updated successfully');
  } catch (err) {
    next(err);
  }
}

async function mergeIssues(req, res, next) {
  try {
    const { duplicateIssueId, note } = req.body;
    const result = await adminService.mergeDuplicateIssues(req.params.id, duplicateIssueId, note, req.user);
    return sendSuccess(res, result, 'Duplicate issue merged successfully');
  } catch (err) {
    next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    const categories = await adminService.getCategories();
    return res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await adminService.createCategory(req.body);
    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await adminService.updateCategory(req.params.id, req.body);
    return sendSuccess(res, category, 'Category updated successfully');
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await adminService.getUsers();
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role, department } = req.body;
    const user = await adminService.updateUserRole(req.params.id, role, department);
    return sendSuccess(res, user, 'User role/department updated successfully');
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const result = await adminService.deleteCategory(req.params.id);
    return sendSuccess(res, result, 'Category deleted/deactivated successfully');
  } catch (err) {
    next(err);
  }
}

async function getAdminAnalytics(req, res, next) {
  try {
    const analytics = await adminService.getAdminAnalytics(req.user);
    return res.status(200).json(analytics);
  } catch (err) {
    next(err);
  }
}

async function exportIssuesCSV(req, res, next) {
  try {
    const csvContent = await adminService.exportIssuesCSV(req.query);
    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="municipal-issues-report-${timestamp}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const logs = await adminService.getAuditLogs(limit);
    return res.status(200).json(logs);
  } catch (err) {
    next(err);
  }
}

async function getSystemSettings(req, res, next) {
  try {
    const settings = await adminService.getSystemSettings();
    return res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
}

async function updateSystemSettings(req, res, next) {
  try {
    const updated = await adminService.updateSystemSettings(req.body, req.user);
    return sendSuccess(res, updated, 'System settings updated successfully');
  } catch (err) {
    next(err);
  }
}

async function assignDepartment(req, res, next) {
  try {
    const { department, note } = req.body;
    const updated = await adminService.assignDepartment(req.params.id, department, note, req.user);

    if (req.app.get('io')) {
      req.app.get('io').emit('department_assigned', {
        issueId: req.params.id,
        department,
        note,
      });
    }

    return sendSuccess(res, updated, 'Department assigned successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getAdminIssues,
  getAdminIssueReview,
  updateStatus,
  updatePriority,
  mergeIssues,
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
