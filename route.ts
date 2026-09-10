import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('deriv_token')?.value || null;
  const loginid = request.cookies.get('deriv_loginid')?.value || null;
  const currency = request.cookies.get('deriv_currency')?.value || null;
  return NextResponse.json({ token, loginid, currency });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('deriv_token');
  response.cookies.delete('deriv_loginid');
  response.cookies.delete('deriv_currency');
  return response;
}
