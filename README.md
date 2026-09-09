# TraderScheme

Next.js terminal that connects a Deriv account over OAuth, streams live ticks over the classic WebSocket API, and places CALL/PUT contracts.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Localhost OAuth is blocked

Deriv requires an **HTTPS** redirect URL and rejects `http://localhost`. That is expected.

Local options:

1. **API token (recommended locally)** — paste a token from Deriv → Security → API token (`read`, `trade`, `trading_information`). The landing page connects with that token; no redirect.
2. **HTTPS tunnel** — ngrok / Cloudflare Tunnel, then register  
   `https://your-tunnel.example/api/auth/deriv/callback`.
3. **HTTPS localhost** — some apps accept `https://localhost:8443/` if that exact URL is registered (Deriv’s own bot template uses this).

Production OAuth redirect must be a public `https://` origin that matches Application Manager exactly. Numeric `NEXT_PUBLIC_DERIV_APP_ID` is still required for the WebSocket `app_id` query (1089 works for experiments).

## Auth flow

1. **CONNECT DERIV ACCOUNT** sends the user to  
   `https://oauth.deriv.com/oauth2/authorize?app_id=...`
2. Deriv redirects back with `acctN`, `tokenN`, `curN` query params.
3. `/api/auth/deriv/callback` stores httpOnly cookies and forwards the same params to `/dashboard`.
4. The dashboard copies the tokens into `sessionStorage` (needed by the browser WebSocket) and opens `wss://ws.binaryws.com/websockets/v3?app_id=...`.
5. The socket sends `{ authorize: token }`, then `balance` (subscribe), `active_symbols`, `ticks`, `proposal`, `buy`, and `portfolio`.

## Markup

`NEXT_PUBLIC_DERIV_MARKUP_PERCENT` (default 3) only changes the **displayed** payout. The contract is still bought at Deriv’s `ask_price`. A real commission has to be configured on the Deriv app / partner side; you cannot silently keep the haircut by buying at a fake price.

## Notes

- Tokens live in the tab (`sessionStorage`) plus short-lived httpOnly cookies. Closing the tab drops the JS copy.
- This is a thin client around Deriv’s own matching engine. You are not running a broker.
- Binary options / multipliers may be restricted by the user’s country and landing company.
