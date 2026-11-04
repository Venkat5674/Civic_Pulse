const { z } = require('zod');

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().min(5, 'Category description is required'),
  icon: z.string().optional().default('HelpCircle'),
  department: z.string().optional().default('Municipal Department'),
  priorityWeight: z.number().min(0.5).max(3.0).optional().default(1.0),
  isActive: z.boolean().optional().default(true),
});

module.exports = {
  categorySchema,
};
