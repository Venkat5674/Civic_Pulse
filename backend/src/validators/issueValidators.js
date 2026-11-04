const { z } = require('zod');

const createIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  categoryId: z.string().min(1, 'Category selection is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  latitude: z.number({ required_error: 'Latitude is required' }),
  longitude: z.number({ required_error: 'Longitude is required' }),
  address: z.string().optional(),
  isLiveCapture: z.literal(true, { errorMap: () => ({ message: 'A live camera capture is required' }) }),
  capturedLatitude: z.number(),
  capturedLongitude: z.number(),
  capturedAt: z.union([z.string(), z.date()]),
  images: z.array(z.object({
    imageUrl: z.string().min(1),
    publicId: z.string().optional().nullable(),
    isLiveCamera: z.literal(true),
    latitude: z.number(),
    longitude: z.number(),
    capturedAt: z.union([z.string(), z.date()]),
  })).min(1, 'At least one live camera image is required'),
});

const updateIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(150).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters long').optional(),
  categoryId: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CANCELLED']).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  assignedDepartment: z.string().optional(),
});

const cancelIssueSchema = z.object({
  reason: z.string().max(300).optional(),
});

const commentSchema = z.object({
  body: z.string().min(1, 'Comment body cannot be empty').max(1000),
});

module.exports = {
  createIssueSchema,
  updateIssueSchema,
  cancelIssueSchema,
  commentSchema,
};
