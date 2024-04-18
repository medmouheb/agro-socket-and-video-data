// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
app.use(cors());

// Maintain a map of connected users with their usernames
let connectedUsers = new Map();

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for setUsername event to set the username for the connected user
  socket.on('setUsername', (username) => {
    connectedUsers.set(socket.id, username);
    // Send updated list of connected users with usernames to all clients
    io.emit('users', Array.from(connectedUsers).map(([id, username]) => ({ id, username })));
  });

  // Listen for incoming messages
  socket.on('message', (data) => {
    const { recipient, message } = data;
    io.to(recipient).emit('message', { sender: socket.id, username: connectedUsers.get(socket.id), message });
  });

  // Listen for disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    connectedUsers.delete(socket.id);
    // Send updated list of connected users with usernames to all clients
    io.emit('users', Array.from(connectedUsers).map(([id, username]) => ({ id, username })));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
