import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const dynamic = 'force-dynamic';

export async function GET() {
  const cfbOpen = (await redis.get<boolean>('cave:cfb')) ?? true;
  const nflOpen = (await redis.get<boolean>('cave:nfl')) ?? true;
  return NextResponse.json({ cfbOpen, nflOpen });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { league, open, secret } = body;

  if (secret !== process.env.CAVE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (league !== 'cfb' && league !== 'nfl') {
    return NextResponse.json({ error: 'Invalid league' }, { status: 400 });
  }

  await redis.set(`cave:${league}`, open);

  return NextResponse.json({ success: true });
}

