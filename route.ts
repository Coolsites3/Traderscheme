import { NextRequest, NextResponse } from 'next/server';

function parseAccounts(searchParams: URLSearchParams) {
  const accounts: { loginid: string; token: string; currency: string }[] = [];
  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith('acct')) continue;
    const index = key.replace('acct', '');
    const token = searchParams.get(`token${index}`);
    const currency = searchParams.get(`cur${index}`);
    if (token) {
      accounts.push({ loginid: value, token, currency: (currency || 'USD').toUpperCase() });
    }
  }
  return accounts;
}

export async function GET(request: NextRequest) {
  const accounts = parseAccounts(request.nextUrl.searchParams);

  // Forward tokens on the query string so the client page can persist them
  // in sessionStorage (browser WebSocket authorize needs the token in JS).
  const dest = new URL('/dashboard', request.url);
  if (accounts.length > 0) {
    accounts.forEach((a, i) => {
      const n = i + 1;
      dest.searchParams.set(`acct${n}`, a.loginid);
      dest.searchParams.set(`token${n}`, a.token);
      dest.searchParams.set(`cur${n}`, a.currency);
    });
  }

  const response = NextResponse.redirect(dest);

  if (accounts.length > 0) {
    const primary = accounts[0];
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60,
      path: '/',
    };
    response.cookies.set('deriv_token', primary.token, cookieOpts);
    response.cookies.set('deriv_loginid', primary.loginid, cookieOpts);
    response.cookies.set('deriv_currency', primary.currency, cookieOpts);
  }

  return response;
}
