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
    <main className="min-h-screen bg-[#3E2317] text-white p-6">
      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('cfb')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'cfb' ? 'bg-white text-stone-900' : 'bg-stone-700 text-stone-300'
          }`}
        >
          Saturday - CFB 
        </button>
        <button
          onClick={() => setActiveTab('nfl')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'nfl' ? 'bg-white text-stone-900' : 'bg-stone-700 text-stone-300'
          }`}
        >
          Sunday - NFL
        </button>
      </div>

      {/* Neon Cave Status Banner */}
      <div className="bg-black rounded-lg py-4 mb-8 mx-auto max-w-md text-center border border-stone-700">
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

      {loading && <p className="text-center text-stone-400">Loading games...</p>}

      {!loading && activeTab === 'cfb' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cfbWindows.map((window) => (
            <WindowSection
              key={window}
              title={window}
              games={cfbGames.filter((g) => g.window === window)}
              limit={6}
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
  limit,
}: {
  title: string;
  games: (CfbGame | NflGame)[];
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const sortedGames = [...games].sort((a, b) => a.gameRank - b.gameRank);
  const hasMore = !!limit && sortedGames.length > limit;
  const visibleGames = expanded || !limit ? sortedGames : sortedGames.slice(0, limit);

  return (
    <div className="bg-white rounded-lg p-4 border border-stone-300 shadow-sm">
      <h2 className="text-xl font-semibold mb-3 text-stone-900">{title}</h2>
      {sortedGames.length === 0 && (
        <p className="text-stone-400 text-sm">No games in this window</p>
      )}
      <div className="space-y-3">
        {visibleGames.map((game, index) => {
          const isBigTV = index === 0;
          return (
            <div
              key={game.id}
              className={`rounded-lg p-3 border ${
                isBigTV ? 'bg-black border-black' : 'bg-stone-100 border-stone-300'
              }`}
            >
              {isBigTV && (
                <div className="text-xs font-bold text-white mb-1">📺 BIG TV</div>
              )}
              <div className={`text-xs mb-2 ${isBigTV ? 'text-stone-400' : 'text-stone-500'}`}>
                {game.network}
              </div>
              <div
                className={`flex items-center justify-between text-sm ${
                  isBigTV ? 'text-white' : 'text-stone-900'
                }`}
              >
                <div className="flex items-center gap-1">
                  {game.away.logo && (
                    <img src={game.away.logo} alt={game.away.abbreviation} className="w-5 h-5" />
                  )}
                  {'rank' in game.away && game.away.rank && (
                    <span className={`font-bold ${isBigTV ? 'text-amber-400' : 'text-amber-700'}`}>
                      #{game.away.rank}
                    </span>
                  )}
                  <span>{game.away.abbreviation}</span>
                </div>
                <span className={isBigTV ? 'text-stone-500' : 'text-stone-400'}>@</span>
                <div className="flex items-center gap-1">
                  {game.home.logo && (
                    <img src={game.home.logo} alt={game.home.abbreviation} className="w-5 h-5" />
                  )}
                  {'rank' in game.home && game.home.rank && (
                    <span className={`font-bold ${isBigTV ? 'text-amber-400' : 'text-amber-700'}`}>
                      #{game.home.rank}
                    </span>
                  )}
                  <span>{game.home.abbreviation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full text-center text-sm font-semibold text-stone-700 hover:text-black flex items-center justify-center gap-1"
        >
          {expanded ? 'Show Less' : `Show ${sortedGames.length - (limit ?? 0)} More`}
          <span className={`transition-transform inline-block ${expanded ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </button>
      )}
    </div>
  );
}

