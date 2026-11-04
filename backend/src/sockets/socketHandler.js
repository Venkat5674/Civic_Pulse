const logger = require('../config/logger');

function initSocket(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join room based on user ID or role
    socket.on('join_room', (data) => {
      if (data && data.userId) {
        socket.join(`user_${data.userId}`);
        logger.info(`Socket ${socket.id} joined room user_${data.userId}`);
      }
      if (data && data.role === 'ADMIN') {
        socket.join('admin_room');
        logger.info(`Socket ${socket.id} joined admin_room`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = {
  initSocket,
};
