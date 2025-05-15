'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UsernamePage() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (username.trim()) {
      localStorage.setItem('username', username);
      router.push('/chat');
    }
  };

  return (
    <div className="container">
      <h2>Enter a username to join the chat</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <button onClick={handleSubmit}>Join Chat</button>
    </div>
  );
}
