import { NextResponse } from 'next/server';

export const revalidate = 60;

const POWER4_TEAMS = new Set([
  // SEC
  'ALA', 'ARK', 'AUB', 'FLA', 'UGA', 'UK', 'LSU', 'MSST', 'MIZ', 'MISS',
  'OU', 'SC', 'TENN', 'TEX', 'TA&M', 'VAN',
  // Big Ten
  'ILL', 'IU', 'IOWA', 'MD', 'MICH', 'MSU', 'MINN', 'NEB', 'NW', 'OSU',
  'ORE', 'PSU', 'PUR', 'RUTG', 'UCLA', 'USC', 'WASH', 'WIS',
  // ACC (+ Notre Dame, treated as Power 4 caliber)
  'BC', 'CAL', 'CLEM', 'DUKE', 'FSU', 'GT', 'LOU', 'MIA', 'NCSU', 'UNC',
  'ND', 'PITT', 'SMU', 'STAN', 'SYR', 'UVA', 'VT', 'WAKE',
  // Big 12
  'ARIZ', 'ASU', 'BAY', 'BYU', 'CIN', 'COLO', 'HOU', 'ISU', 'KU', 'KSU',
  'OKST', 'TCU', 'TTU', 'UCF', 'UTAH', 'WVU',
]);

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
  if (hour < 14) return 'Noon';
  if (hour < 18) return '3:30';
  if (hour < 22) return 'Primetime';
  return 'Late Night';
}

function calculateScore(
  homeRank: number | null,
  awayRank: number | null,
  homeP4: boolean,
  awayP4: boolean
): number {
  const rankPoints =
    (homeRank ? 26 - homeRank : 0) + (awayRank ? 26 - awayRank : 0);
  let power4Bonus = 0;
  if (homeP4 && awayP4) power4Bonus = 30;
  else if (homeP4 || awayP4) power4Bonus = 15;
  return rankPoints + power4Bonus;
}

export async function GET() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?groups=80&limit=200',
      { next: { revalidate: 60 } }
    );
    const data = await res.json();

    let games = data.events
      .map((event: any) => {
        const competition = event.competitions[0];
        const home = competition.competitors.find((c: any) => c.homeAway === 'home');
        const away = competition.competitors.find((c: any) => c.homeAway === 'away');
        const { hour, weekday } = getEasternInfo(event.date);

        const homeRank =
          home.curatedRank?.current && home.curatedRank.current <= 25
            ? home.curatedRank.current
            : null;
        const awayRank =
          away.curatedRank?.current && away.curatedRank.current <= 25
            ? away.curatedRank.current
            : null;

        const homeP4 = POWER4_TEAMS.has(home.team.abbreviation);
        const awayP4 = POWER4_TEAMS.has(away.team.abbreviation);
        const isUGA =
          home.team.abbreviation === 'UGA' || away.team.abbreviation === 'UGA';

        return {
          id: event.id,
          startTime: event.date,
          weekday,
          window: getWindow(hour),
          network: competition.broadcasts?.[0]?.names?.[0] || 'TBD',
          isUGA,
          score: calculateScore(homeRank, awayRank, homeP4, awayP4),
          home: {
  name: `${home.team.location} ${home.team.name}`,
  abbreviation: home.team.abbreviation,
  rank: homeRank,
  logo: home.team.logo || home.team.logos?.[0]?.href || null,
},
away: {
  name: `${away.team.location} ${away.team.name}`,
  abbreviation: away.team.abbreviation,
  rank: awayRank,
  logo: away.team.logo || away.team.logos?.[0]?.href || null,
},
        };
      })
      .filter((game: any) => game.weekday === 'Saturday');

    // Sort chronologically first (tiebreaker), then by score (best games first)
    games.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    games.sort((a: any, b: any) => b.score - a.score);

    // Force UGA's game to #1 no matter what
    const ugaIndex = games.findIndex((g: any) => g.isUGA);
    if (ugaIndex > 0) {
      const [ugaGame] = games.splice(ugaIndex, 1);
      games.unshift(ugaGame);
    }

    // Assign final overall game ranking
    games = games.map((game: any, index: number) => ({
      ...game,
      gameRank: index + 1,
    }));

    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CFB schedule' }, { status: 500 });
  }
}

