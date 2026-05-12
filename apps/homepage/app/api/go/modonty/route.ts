import { NextResponse, type NextRequest } from 'next/server';
import { sendTelegramVisitNotification } from '@/actions/sendTelegramNotification';

const MODONTY_URL = 'https://modonty.com';

export async function GET(request: NextRequest) {
  const city = request.headers.get('x-vercel-ip-city');
  const country = request.headers.get('x-vercel-ip-country');

  // Fire-and-forget — don't block the redirect on Telegram round-trip.
  void sendTelegramVisitNotification({ city, country }).catch((err) =>
    console.error('Telegram visit notification failed:', err),
  );

  return NextResponse.redirect(MODONTY_URL, 302);
}
