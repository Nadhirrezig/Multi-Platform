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
      'http://192.168.1.11:3000',
    ],
    methods: ['GET', 'POST']
    }
  },
  {connectionStateRecovery: {}} // cool shit when client disconnectes for a short delay for exemple switching from WIFI to 4/5G
);

app.use(express.json());
app.use(cors({origin: ['http://localhost:3000' , 'http://192.168.1.11:3000']}));
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

app.post('/messages', (req, res) => {
  const message = req.body.message;
  console.log('Received POST:', message);
  messages.push(message);
  io.emit('new-message', message);
  console.log('Broadcasted:', message);
  const payload = JSON.stringify({
    title: 'New Message',
    body: message,
  });
  subscriptions.forEach((subscription) => {
    webpush.sendNotification(subscription, payload)
      .catch((err) => console.error('Push failed:', err));
  });
  res.json({ status: 'Sent', message });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
server.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});