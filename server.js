const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const webpush = require('web-push');
const io = new Server(
  server , 
  {
    cors: {
    origin: [
      'http://localhost:3000',
      'http://192.168.1.16:3000'
    ],
    methods: ['GET', 'POST']
    }
  },
  {connectionStateRecovery: {}} // cool shit when client disconnectes for a short delay for exemple switching from WIFI to 4G/5G
);

app.use(express.json());
app.use(cors({origin: [ 'http://localhost:3000' , 'http://192.168.1.16' ]}));
// this will only work in local machine , other wise you can use * in origin
// app.use(cors({origin: '*'}));
// and ofcourse not only here you need to copy past your IP adress to page.tsx in nextjs webapp same as you did in this file
// changing localhost:3000 to your IP adress and destinated port number
// better to use a static ip adress for the testing so you dont need to change it every time you restart your router
// with this in mind , now you can send and recieve message using different devices in the same network
// congrats you built your own server
// thats it for today 17/03
const vapidkeys = {
  PRIVATEKEY : "o_lLhx-b5XuWO0evNc_ngHs3u6oYAknthBe4CsizPLQ",
  PUBLICKEY : "BME6S9g2Uqstk9_Y15xclo7mFV92_MH8oe2k2Z0IJGyP3yUSwYjz1rJveTEQVWrOPLC44R1RQooKchJNpYf3330"
}
webpush.setVapidDetails(
  'mailto:rzignadhir56@gmail.com',
  vapidkeys.PUBLICKEY,
  vapidkeys.PRIVATEKEY
);
let messages = [];

// kthor 3liya lcode brojla


let subscriptions = [];


app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  console.log('Received subscription:', subscription);
  subscriptions.push(subscription);
  res.status(201).json({ status: 'Subscribed' });
});


app.get('/messages', (req, res) => {
  res.json(messages);
});


/////////////////////////////////////////////////////////////////////////////POST REQUEST /////////////////////////////////////////////////////////////
// O9sem blh dhaba3t 3iniya maash tchuf fi chy 


app.post('/messages', (req, res) => {
  const { message, room } = req.body;
  if (!message || !room) {
    return res.status(400).json({ error: 'ena ou inty are required' });
  }
  const messageData = { message, room, timestamp: Date.now() };
  messages.push(messageData);
  console.log('Stored fi rasi:', messageData);
  const payload = JSON.stringify({
    title: `New Message in ${room}`,
    body: message,
  });
  Promise.all(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => console.error('Notification failed:', err))
    )
  ).then(() => res.status(201).json({ status: 'Message sent', data: messageData }));
});



/////////////////////////////////////////////////////////////////////////// handling connection and disconnection //////////////////////////////////////////////////
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit(`new-message', '${socket.id},Welcome to the chat!`);
  socket.on('join-room', (room) => {
    if (typeof room !== 'string' || !room) {
      console.log('Invalid room:', room);
      return;
    }
    socket.join(room);
    socket.broadcast.to(room).emit('new-message', `${socket.id}: has Joined room: ${room}`);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('send-message', (data) => {
    const { room, message } = data;
    if (!message || typeof message !== 'string') {
      console.log('Invalid message:', data);
      return;
    }
    const messageData = { message, room: room || 'broadcast', timestamp: Date.now() };
    messages.push(messageData);

    if (room) {
      io.to(room).emit('new-message', message);
      console.log(`Sent to room ${room}: ${message}`);
    } else {
      io.emit('new-message', message);
      console.log(`Broadcasted: ${message}`);
    }
    const payload = JSON.stringify({
      title: room ? `New Message in ${room}` : 'New Broadcast Message',
      body: message,
    });
    subscriptions.forEach((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => console.error('Push failed:', err))
    );
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});