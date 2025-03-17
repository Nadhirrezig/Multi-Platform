const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = new Server(server , 
  {
  cors: {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(cors({origin: 'http://localhost:3000'}));
// this will only work in local machine , other wise you can use * in origin
// app.use(cors({origin: '*'}));
// and ofcourse not only here you need to copy past your IP adress to page.tsx in nextjs webapp same as you did in this file
// changing localhost:3000 to your IP adress and destinated port number
// better to use a static ip adress for the testing so you dont need to change it every time you restart your router
// with this in mind , now you can send and recieve message using different devices in the same network
// congrats you built your own server
// thats it for today 17/03

let messages = [];
app.get('/messages', (req, res) => {
  res.json(messages);
});

app.post('/messages', (req, res) => {
  const message = req.body.message;
  messages.push(message);
  io.emit('new-message', message);
  res.json({ status: 'Message sent', message });
});

io.on('connection', (socket) => {
  const ip = socket.handshake.address;
  console.log(ip,'Someone connected!');
});

server.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});