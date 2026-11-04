const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validateBody } = require('../middleware/validate');
const {
  updateStatusSchema,
  updatePrioritySchema,
  mergeIssueSchema,
  updateUserRoleSchema,
  assignDepartmentSchema,
  updateSettingsSchema,
} = require('../validators/adminValidators');
const { categorySchema } = require('../validators/categoryValidators');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Enforce ADMIN role on all admin endpoints
router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAdminAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/settings', adminController.getSystemSettings);
router.patch('/settings', validateBody(updateSettingsSchema), adminController.updateSystemSettings);
router.get('/export/csv', adminController.exportIssuesCSV);
router.get('/issues', adminController.getAdminIssues);
router.get('/issues/:id/review', adminController.getAdminIssueReview);
router.patch('/issues/:id/status', validateBody(updateStatusSchema), adminController.updateStatus);
router.patch('/issues/:id/priority', validateBody(updatePrioritySchema), adminController.updatePriority);
router.patch('/issues/:id/department', validateBody(assignDepartmentSchema), adminController.assignDepartment);
router.post('/issues/:id/merge', validateBody(mergeIssueSchema), adminController.mergeIssues);

router.get('/categories', adminController.getCategories);
router.post('/categories', validateBody(categorySchema), adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', validateBody(updateUserRoleSchema), adminController.updateUserRole);

module.exports = router;

