'use client';

import { useState, useEffect } from 'react';

export default function ControlRoom() {
  const [password, setPassword] = useState('');
  const [cfbOpen, setCfbOpen] = useState<boolean | null>(null);
  const [nflOpen, setNflOpen] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    const res = await fetch('/api/cave');
    const data = await res.json();
    setCfbOpen(data.cfbOpen);
    setNflOpen(data.nflOpen);
  }

  async function toggle(league: 'cfb' | 'nfl', currentValue: boolean) {
    setMessage('');
    const res = await fetch('/api/cave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ league, open: !currentValue, secret: password }),
    });

    if (res.ok) {
      setMessage('Updated!');
      fetchStatus();
    } else {
      setMessage('Wrong password or error.');
    }
  }

  return (
    <main className="min-h-screen bg-stone-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">🔒 Cave Control Room</h1>

      <input
        type="password"
        placeholder="Enter secret password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-6 px-4 py-2 rounded text-black"
      />

      {message && <p className="mb-4 text-yellow-400">{message}</p>}

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="bg-stone-800 p-4 rounded-lg flex items-center justify-between">
          <span>CFB Cave: {cfbOpen === null ? '...' : cfbOpen ? 'OPEN' : 'CLOSED'}</span>
          <button
            onClick={() => cfbOpen !== null && toggle('cfb', cfbOpen)}
            className="bg-orange-600 px-4 py-2 rounded font-bold"
          >
            Toggle
          </button>
        </div>

        <div className="bg-stone-800 p-4 rounded-lg flex items-center justify-between">
          <span>NFL Cave: {nflOpen === null ? '...' : nflOpen ? 'OPEN' : 'CLOSED'}</span>
          <button
            onClick={() => nflOpen !== null && toggle('nfl', nflOpen)}
            className="bg-blue-600 px-4 py-2 rounded font-bold"
          >
            Toggle
          </button>
        </div>
      </div>
    </main>
  );
}

