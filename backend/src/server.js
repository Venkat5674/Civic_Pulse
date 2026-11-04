const env = require('./config/env');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const logger = require('./config/logger');
const { initSocket } = require('./sockets/socketHandler');

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

initSocket(io);
app.set('io', io);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`⚡ CivicPulse Backend Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`📧 Email notifications active (${env.EMAIL.HOST || 'Ethereal Dev Mode'})`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});
