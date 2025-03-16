const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// A simple list to store messages (like a database)
let messages = [];

// API to get all messages
app.get('/messages', (req, res) => {
  res.json(messages);
});

// API to send a message
app.post('/messages', (req, res) => {
  const message = req.body.message;
  messages.push(message);
  io.emit('new-message', message); // Shout it to everyone
  res.json({ status: 'Message sent', message });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Someone connected!');
});

server.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});