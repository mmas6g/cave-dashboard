'use client';

import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'cfb' | 'nfl'>('cfb');

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🏈 Cave Dashboard</h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('cfb')}
          className={`px-6 py-2 rounded-lg font-semibold ${
            activeTab === 'cfb' ? 'bg-orange-600' : 'bg-gray-700'
          }`}
        >
          Saturday - College Football
        </button>
        <button
          onClick={() => setActiveTab('nfl')}
          className={`px-6 py-2 rounded-lg font-semibold ${
            activeTab === 'nfl' ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          Sunday - NFL
        </button>
      </div>

      {/* Cave Toggle Placeholder */}
      <div className="flex justify-center mb-8">
        <button className="px-4 py-2 bg-green-600 rounded-lg font-bold">
          Cave: OPEN
        </button>
      </div>

      {/* Content */}
      {activeTab === 'cfb' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <WindowSection title="Noon" />
          <WindowSection title="3:30" />
          <WindowSection title="Primetime" />
          <WindowSection title="Late Night" />
        </div>
      )}

      {activeTab === 'nfl' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WindowSection title="Early (1:00)" />
          <WindowSection title="Late Afternoon (4:05/4:25)" />
          <WindowSection title="Sunday Night" />
        </div>
      )}
    </main>
  );
}

function WindowSection({ title }: { title: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-400 text-sm">Games will appear here</p>
    </div>
  );
}
