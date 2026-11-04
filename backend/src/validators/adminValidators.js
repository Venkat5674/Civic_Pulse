const { z } = require('zod');

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
  note: z.string().optional().default(''),
});

const updatePrioritySchema = z.object({
  priorityScore: z.number().min(1).max(100),
  note: z.string().optional().default(''),
});

const mergeIssueSchema = z.object({
  duplicateIssueId: z.string().min(1, 'Duplicate issue ID is required'),
  note: z.string().optional().default(''),
});

const assignDepartmentSchema = z.object({
  department: z.string().min(1, 'Department name is required'),
  note: z.string().optional().default(''),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['CITIZEN', 'ADMIN', 'GUEST', 'SUPER_ADMIN']).optional(),
  department: z.string().nullable().optional(),
});

const updateSettingsSchema = z.record(z.any());

module.exports = {
  updateStatusSchema,
  updatePrioritySchema,
  mergeIssueSchema,
  updateUserRoleSchema,
  assignDepartmentSchema,
  updateSettingsSchema,
};
