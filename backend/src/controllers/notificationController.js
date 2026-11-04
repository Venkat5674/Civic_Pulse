const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/apiResponse');

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    return res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    await notificationService.markNotificationAsRead(req.params.id, req.user.id);
    return sendSuccess(res, {}, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllNotificationsAsRead(req.user.id);
    return sendSuccess(res, {}, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
