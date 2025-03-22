"use client";

import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import {setupconnection} from './lib/connection';
interface ServerToClientEvents {
  'new-message': (message: string) => void;
}

interface ClientToServerEvents {
  // bal bla blaaaaa
}
const backendURL = 'http://192.168.1.11:4000';
export default function Home() {
  const [message, setMessage] = useState<string>(''); 
  const [messages, setMessages] = useState<string[]>([]); 

  useEffect(() => {
    console.log('Connecting to:', backendURL);
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(backendURL);
  
    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('new-message', (newMessage: string) => {
      console.log('Received:', newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });
    socket.on('connect_error', (err) => console.error('Socket error:', err));
    setupconnection();
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    fetch(`${backendURL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    setMessage('');
  };

  return (
    <div>
      <h1>Web App</h1>
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