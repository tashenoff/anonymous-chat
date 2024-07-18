const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const { handleJoin } = require('./events/connection');
const { handleMessage } = require('./events/message');
const { handleUserDisconnect } = require('./events/disconnect');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (user) => handleJoin(socket, user));
  socket.on('message', (data) => handleMessage(io, data));
  socket.on('userDisconnect', () => handleUserDisconnect(io, socket.id));
  socket.on('disconnect', () => handleUserDisconnect(io, socket.id));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
