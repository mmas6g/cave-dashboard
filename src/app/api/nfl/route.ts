import { NextResponse } from 'next/server';

export const revalidate = 60;

function getEasternInfo(isoString: string) {
  const date = new Date(isoString);
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    hour12: false,
  }).format(date);
  let hour = parseInt(hourStr, 10);
  if (hour === 24) hour = 0;

  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
  }).format(date);

  return { hour, weekday };
}

function getWindow(hour: number): string {
  if (hour < 14) return 'Early (1:00)';
  if (hour < 19) return 'Late Afternoon (4:05/4:25)';
  return 'Sunday Night';
}

function recordScore(record: string | null): number {
  if (!record) return 0;
  const parts = record.split('-').map(Number);
  const wins = parts[0] || 0;
  const losses = parts[1] || 0;
  return wins - losses;
}

export async function GET() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
      { next: { revalidate: 60 } }
    );
    const data = await res.json();

    let games = data.events
      .map((event: any) => {
        const competition = event.competitions[0];
        const home = competition.competitors.find((c: any) => c.homeAway === 'home');
        const away = competition.competitors.find((c: any) => c.homeAway === 'away');
        const { hour, weekday } = getEasternInfo(event.date);
        const network = competition.broadcasts?.[0]?.names?.[0] || 'TBD';

        const homeRecord = home.records?.[0]?.summary || null;
        const awayRecord = away.records?.[0]?.summary || null;

        let score = recordScore(homeRecord) + recordScore(awayRecord);
        if (network === 'NBC') score += 5; // Sunday Night Football bonus

        return {
          id: event.id,
          startTime: event.date,
          weekday,
          window: getWindow(hour),
          network,
          score,
          home: { name: `${home.team.location} ${home.team.name}`, abbreviation: home.team.abbreviation, record: homeRecord },
          away: { name: `${away.team.location} ${away.team.name}`, abbreviation: away.team.abbreviation, record: awayRecord },
        };
      })
      .filter((game: any) => game.weekday === 'Sunday');

    games.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    games.sort((a: any, b: any) => b.score - a.score);

    games = games.map((game: any, index: number) => ({
      ...game,
      gameRank: index + 1,
    }));

    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch NFL schedule' }, { status: 500 });
  }
}
