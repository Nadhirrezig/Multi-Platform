"use client";

import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

interface ServerToClientEvents {
  'new-message': (message: string) => void;
}

interface ClientToServerEvents {
  // bal bla blaaaaa
}

export default function Home() {
  const [message, setMessage] = useState<string>(''); 
  const [messages, setMessages] = useState<string[]>([]); 

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:4000');
    // no more pain in the ass , the problem was with my version configuration ... i was using an older version hahahahhahaha
    // now Socket is declared an interface , it wasnt because of my old socket.io version
    socket.on('new-message', (newMessage: string) => {
      setMessages((prev) => [...prev, newMessage]);
    });
  
    fetch('http://localhost:4000/messages')
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        return res.json();
      })
      .then((data: string[]) => setMessages(data))
      .catch((err) => console.error('Fetch error:', err));
  
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