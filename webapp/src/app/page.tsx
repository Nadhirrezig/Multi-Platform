"use client";

import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { setupconnection } from './lib/connection';
import './page.css';

interface ServerToClientEvents {
  'new-message': (message: string) => void;
}

interface ClientToServerEvents {
  'join-room': (room: string) => void;
}

const backendURL = 'http://192.168.1.16:4000';

export default function Home() {
  const [roomName, setRoomName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    setupconnection();
    const socket = io(backendURL);
    socketRef.current = socket;
    console.log('Connecting to:', backendURL);
    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('new-message', (newMessage: string) => {
      console.log('Received:', newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });
    socket.on('connect_error', (err) => console.error('Socket error:', err));
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (roomName && socketRef.current) {
      socketRef.current.emit('join-room', roomName);
      console.log(`Joined room: ${roomName}`);
    }
  }, [roomName]);

  const sendMessage = () => {
    if (roomName && message && socketRef.current) {
      fetch(`${backendURL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomName, message }),
      })
        .catch((err) => console.error('Send failed:', err));
      setMessage('');
    } else {
      console.log('Room name or message is empty');
    }
  };

  return (
    <div className="container">
      <h1>Chat App</h1>
      <input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Type a room name"
      />
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}