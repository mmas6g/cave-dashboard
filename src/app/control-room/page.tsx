'use client';

import { useState, useEffect } from 'react';

type CfbGame = {
  id: string;
  startTime: string;
  window: string;
  network: string;
  gameRank: number;
  home: { name: string; abbreviation: string; rank: number | null; logo: string | null };
  away: { name: string; abbreviation: string; rank: number | null; logo: string | null };
};

type NflGame = {
  id: string;
  startTime: string;
  window: string;
  network: string;
  gameRank: number;
  home: { name: string; abbreviation: string; record: string | null; logo: string | null };
  away: { name: string; abbreviation: string; record: string | null; logo: string | null };
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'cfb' | 'nfl'>('cfb');
  const [cfbOpen, setCfbOpen] = useState<boolean | null>(null);
  const [nflOpen, setNflOpen] = useState<boolean | null>(null);
  const [cfbGames, setCfbGames] = useState<CfbGame[]>([]);
  const [nflGames, setNflGames] = useState<NflGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cfbRes, nflRes, caveRes] = await Promise.all([
          fetch('/api/cfb'),
          fetch('/api/nfl'),
          fetch('/api/cave'),
        ]);
        const cfbData = await cfbRes.json();
        const nflData = await nflRes.json();
        const caveData = await caveRes.json();
        setCfbGames(cfbData.games || []);
        setNflGames(nflData.games || []);
        setCfbOpen(caveData.cfbOpen);
        setNflOpen(caveData.nflOpen);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const cfbWindows = ['Noon', '3:30', 'Primetime', 'Late Night'];
  const nflWindows = ['Early (1:00)', 'Late Afternoon (4:05/4:25)', 'Sunday Night'];
  const currentCaveStatus = activeTab === 'cfb' ? cfbOpen : nflOpen;

  return (
    <main className="min-h-screen bg-[#FBF3E7] text-stone-800 p-6">

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('cfb')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'cfb' ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'
          }`}
        >
          Saturday - College Football
        </button>
        <button
          onClick={() => setActiveTab('nfl')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'nfl' ? 'bg-blue-700 text-white' : 'bg-stone-200 text-stone-600'
          }`}
        >
          Sunday - NFL
        </button>
      </div>

      {/* Neon Cave Status Banner */}
      <div className="bg-stone-900 rounded-lg py-4 mb-8 mx-auto max-w-md text-center">
        {currentCaveStatus === null ? (
          <span className="text-stone-500">Loading status...</span>
        ) : (
          <span
            className={`text-3xl font-extrabold tracking-wide ${
              currentCaveStatus ? 'neon-open' : 'neon-closed'
            }`}
          >
            THE CAVE IS {currentCaveStatus ? 'OPEN' : 'CLOSED'}
          </span>
        )}
      </div>

      {loading && <p className="text-center text-stone-500">Loading games...</p>}

      {!loading && activeTab === 'cfb' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cfbWindows.map((window) => (
            <WindowSection
              key={window}
              title={window}
              games={cfbGames.filter((g) => g.window === window)}
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
              games={nflGames.filter((g) => g.window === window)}
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
  const sortedGames = [...games].sort((a, b) => a.gameRank - b.gameRank);

  return (
    <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-3 text-stone-800">{title}</h2>
      {sortedGames.length === 0 && (
        <p className="text-stone-400 text-sm">No games in this window</p>
      )}
      <div className="space-y-3">
        {sortedGames.map((game, index) => {
          const isBigTV = index === 0;
          return (
            <div
              key={game.id}
              className={`rounded-lg p-3 border ${
                isBigTV ? 'border-orange-400 bg-orange-50' : 'border-amber-200 bg-amber-50'
              }`}
            >
              {isBigTV && (
                <div className="text-xs font-bold text-orange-600 mb-1">📺 BIG TV</div>
              )}
              <div className="text-xs text-stone-500 mb-2">{game.network}</div>
              <div className="flex items-center justify-between text-sm text-stone-800">
                <div className="flex items-center gap-1">
                  {game.away.logo && (
                    <img src={game.away.logo} alt={game.away.abbreviation} className="w-5 h-5" />
                  )}
                  {'rank' in game.away && game.away.rank && (
                    <span className="text-amber-600 font-bold">#{game.away.rank}</span>
                  )}
                  <span>{game.away.abbreviation}</span>
                </div>
                <span className="text-stone-400 text-xs">@</span>
                <div className="flex items-center gap-1">
                  {game.home.logo && (
                    <img src={game.home.logo} alt={game.home.abbreviation} className="w-5 h-5" />
                  )}
                  {'rank' in game.home && game.home.rank && (
                    <span className="text-amber-600 font-bold">#{game.home.rank}</span>
                  )}
                  <span>{game.home.abbreviation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

