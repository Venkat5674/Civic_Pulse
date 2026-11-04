const prisma = require('../config/db');

async function getCommentById(commentId) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      user: { select: { id: true, name: true, role: true, avatarUrl: true } },
      issue: { select: { id: true, title: true } },
    },
  });

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: comment.id,
    issueId: comment.issueId,
    userId: comment.userId,
    userName: comment.user.name,
    userAvatar: comment.user.avatarUrl,
    userRole: comment.user.role,
    body: comment.body,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

async function updateComment(commentId, body, currentUser) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (comment.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
    const error = new Error('Unauthorized to modify this comment');
    error.statusCode = 403;
    throw error;
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { body },
    include: {
      user: { select: { id: true, name: true, role: true, avatarUrl: true } },
    },
  });

  return {
    id: updated.id,
    issueId: updated.issueId,
    userId: updated.userId,
    userName: updated.user.name,
    userAvatar: updated.user.avatarUrl,
    userRole: updated.user.role,
    body: updated.body,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

async function deleteComment(commentId, currentUser) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (comment.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
    const error = new Error('Unauthorized to delete this comment');
    error.statusCode = 403;
    throw error;
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { message: 'Comment deleted successfully', id: commentId };
}

module.exports = {
  getCommentById,
  updateComment,
  deleteComment,
};
