"use client"; // Add this at the very top

import { useState, useEffect } from 'react';
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface ServerToClientEvents {
  newMessage: (message: string) => void;
}
export default function Home() {
  const [message, setMessage] = useState<string>(''); // Input text
  const [messages, setMessages] = useState<string[]>([]); // List of messages

  useEffect(() => {
    // Correct typing for Socket.IO client
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:4000");
    socket.on('new-message', (newMessage: string) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    fetch('http://localhost:4000/messages')
      .then((res) => res.json())
      .then((data: string[]) => setMessages(data));

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    fetch('http://localhost:4000/messages', {
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