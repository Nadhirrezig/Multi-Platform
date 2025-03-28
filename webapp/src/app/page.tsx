"use client";

import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import RoomUI from '@/app/ui/input-ui';
import './page.css';
interface ServerToClientEvents {
  'new-message': (message: string) => void;
}

interface ClientToServerEvents {
  'join-room': (room: string) => void;
  'send-message': (data: { room?: string; message: string }) => void;
}
// backend URL is going to change later specially when deploying the app , for now we are just testing , local testing
const backendURL = 'http://192.168.1.16:4000'; // Your IP

export default function Home() {
  const [roomName, setRoomName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    const socket = io(backendURL);
    socketRef.current = socket;
    console.log('Connecting to:', backendURL);
    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('new-message', (newMessage: string) => {
      console.log('Received:', newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });
    socket.on('connect_error', (err) => console.error('Socket error:', err));
    // fetching data from the server when the user connects , im tired 
    fetch(`${backendURL}/messages`)
    .then((res) => res.json())
    .then((data) => {
      console.log('Fetched messages:', data);
      setMessages(data.map((msg: { message: string }) => msg.message));
    })
    .catch((err) => console.error('Fetch messages failed:', err));

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join room when button is clicked
  const joinRoom = () => {
    if (roomName && socketRef.current) {
      socketRef.current.emit('join-room', roomName);
      console.log(`Joined room: ${roomName}`);
    } else {
      console.log('Room name is empty');
    }
  };

  // Send message: room-specific or broadcast 
  const sendMessage = () => {
    if (message && socketRef.current) {
      const data = { message, ...(roomName && { room: roomName }) };
      socketRef.current.emit('send-message', data);
      setMessage('');
    } else {
      console.log('Message is empty');
    }
  };
  return (
    <div className="container">
      <h1>Web App</h1>
      <RoomUI value={message} onChange={setMessage} />
      <input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Type a room name"
      />
      <button onClick={sendMessage}>Send msg</button>
      <button onClick={joinRoom}>Join ROOM</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}