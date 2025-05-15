"use client";

import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import RoomUI from '@/app/ui/input-ui';
import '../page.css';

interface ServerToClientEvents {
  'new-message': (data: { user: string; message: string }) => void;
}

interface ClientToServerEvents {
  'join-room': (room: string) => void;
  'send-message': (data: { room?: string; message: string; user: string }) => void;
}

const backendURL = 'http://192.168.1.26:4000'; // Your IP

export default function Home() {
  const [roomName, setRoomName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const username = typeof window !== 'undefined' ? localStorage.getItem('username') || 'Anonymous' : 'Anonymous';

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      window.location.href = '/';
      return;
    }

    const socket = io(backendURL);
    socketRef.current = socket;

    console.log('Connecting to:', backendURL);

    socket.on('connect', () => console.log('Socket connected:', socket.id));

    socket.on('new-message', (data) => {
      console.log('Received:', data);
      setMessages((prev) => [data, ...prev]);
    });

    socket.on('connect_error', (err) => console.error('Socket error:', err));

    fetch(`${backendURL}/messages`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched messages:', data);
        setMessages(
          data
            .sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp)
            .map((msg: { message: string; user: string }) => ({
              message: msg.message,
              user: msg.user || 'Anonymous'
            }))
        );
      })
      .catch((err) => console.error('Fetch messages failed:', err.message));

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (roomName && socketRef.current) {
      socketRef.current.emit('join-room', roomName);
      console.log(`Joined room: ${roomName}`);
    } else {
      console.log('Room name is empty');
    }
  };

  const sendMessage = () => {
    if (message && socketRef.current) {
      const data = {
        message,
        user: username || 'Anonymous',
        ...(roomName && { room: roomName }),
      };
      socketRef.current.emit('send-message', data);
      setMessage('');
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
          <li key={index}>
            <strong>{msg.user}</strong>: {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
