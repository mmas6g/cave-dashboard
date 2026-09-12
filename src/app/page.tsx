'use client';

import { useState, useEffect } from 'react';

type CfbGame = {
  id: string;
  startTime: string;
  window: string;
  network: string;
  gameRank: number;
  isUGA: boolean;
  home: { name: string; abbreviation: string; rank: number | null };
  away: { name: string; abbreviation: string; rank: number | null };
};

type NflGame = {
  id: string;
  startTime: string;
  window: string;
  network: string;
  gameRank: number;
  home: { name: string; abbreviation: string; record: string | null };
  away: { name: string; abbreviation: string; record: string | null };
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'cfb' | 'nfl'>('cfb');
  const [caveOpen, setCaveOpen] = useState(true);
  const [cfbGames, setCfbGames] = useState<CfbGame[]>([]);
  const [nflGames, setNflGames] = useState<NflGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cfbRes, nflRes] = await Promise.all([
          fetch('/api/cfb'),
          fetch('/api/nfl'),
        ]);
        const cfbData = await cfbRes.json();
        const nflData = await nflRes.json();
        setCfbGames(cfbData.games || []);
        setNflGames(nflData.games || []);
      } catch (error) {
        console.error('Failed to load games', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const cfbWindows = ['Noon', '3:30', 'Primetime', 'Late Night'];
  const nflWindows = ['Early (1:00)', 'Late Afternoon (4:05/4:25)', 'Sunday Night'];

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

      {/* Cave Toggle */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setCaveOpen(!caveOpen)}
          className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors ${
            caveOpen ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Cave: {caveOpen ? 'OPEN' : 'CLOSED'}
        </button>
      </div>

      {loading && <p className="text-center text-gray-400">Loading games...</p>}

      {/* Content */}
      {!loading && activeTab === 'cfb' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cfbWindows.map((window) => (
            <WindowSection
              key={window}
              title={window}
              games={cfbGames
                .filter((g) => g.window === window)
                .sort((a, b) => a.gameRank - b.gameRank)}
            />
          ))}
        </div>
      )}

      {!loading && activeTab === 'nfl' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nflWindows.map((window) => (
            <WindowSection
              key={window}
              title={window}
              games={nflGames
                .filter((g) => g.window === window)
                .sort((a, b) => a.gameRank - b.gameRank)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function WindowSection({
  title,
  games,
}: {
  title: string;
  games: (CfbGame | NflGame)[];
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {games.length === 0 && (
        <p className="text-gray-500 text-sm">No games in this window</p>
      )}
      <div className="space-y-3">
        {games.map((game) => {
          const isBigTV = game.gameRank === 1;
          return (
            <div
              key={game.id}
              className={`rounded p-3 ${
                isBigTV
                  ? 'bg-yellow-900/40 border-2 border-yellow-400'
                  : 'bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">{game.network}</span>
                <span
                  className={`text-xs font-bold ${
                    isBigTV ? 'text-yellow-300' : 'text-gray-400'
                  }`}
                >
                  {isBigTV ? '📺 BIG TV — #1' : `#${game.gameRank}`}
                </span>
              </div>
              <div className="text-sm">
                {'rank' in game.away && game.away.rank && (
                  <span className="text-yellow-400 font-bold mr-1">
                    #{game.away.rank}
                  </span>
                )}
                {game.away.abbreviation}
                {' @ '}
                {'rank' in game.home && game.home.rank && (
                  <span className="text-yellow-400 font-bold mr-1">
                    #{game.home.rank}
                  </span>
                )}
                {game.home.abbreviation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

