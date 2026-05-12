import { NextResponse, type NextRequest } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { sendTelegramVisitNotification } from '@/actions/sendTelegramNotification';

const MODONTY_URL = 'https://modonty.com';

// Make sure each visit is counted — never let CDN/browser cache the redirect.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const city = request.headers.get('x-vercel-ip-city');
  const country = request.headers.get('x-vercel-ip-country');

  // waitUntil keeps the function alive AFTER the response is sent,
  // so the Telegram fetch isn't killed by Vercel's freeze.
  waitUntil(
    sendTelegramVisitNotification({ city, country }).catch((err) =>
      console.error('Telegram visit notification failed:', err),
    ),
  );

  const response = NextResponse.redirect(MODONTY_URL, 302);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
