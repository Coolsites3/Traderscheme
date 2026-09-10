export type DerivAccount = {
  loginid: string;
  token: string;
  currency: string;
};

const TOKEN_KEY = 'deriv_token';
const LOGIN_KEY = 'deriv_loginid';
const CURRENCY_KEY = 'deriv_currency';
const ACCOUNTS_KEY = 'deriv_accounts';

export function parseAccountsFromSearch(search: string): DerivAccount[] {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const accounts: DerivAccount[] = [];

  for (const [key, value] of params.entries()) {
    if (!key.startsWith('acct')) continue;
    const index = key.replace('acct', '');
    const token = params.get(`token${index}`);
    const currency = params.get(`cur${index}`);
    if (token) {
      accounts.push({
        loginid: value,
        token,
        currency: (currency || 'USD').toUpperCase(),
      });
    }
  }

  // Single-token fallback used by some redirects
  const lone = params.get('token1') || params.get('token');
  if (accounts.length === 0 && lone) {
    accounts.push({
      loginid: params.get('acct1') || params.get('loginid') || '',
      token: lone,
      currency: (params.get('cur1') || 'USD').toUpperCase(),
    });
  }

  return accounts;
}

export function persistAccounts(accounts: DerivAccount[]): DerivAccount[] {
  if (typeof window === 'undefined' || accounts.length === 0) return accounts;
  const primary = accounts[0];
  sessionStorage.setItem(TOKEN_KEY, primary.token);
  sessionStorage.setItem(LOGIN_KEY, primary.loginid);
  sessionStorage.setItem(CURRENCY_KEY, primary.currency);
  sessionStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return accounts;
}

export function persistAccountsFromSearch(search: string): DerivAccount[] {
  return persistAccounts(parseAccountsFromSearch(search));
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY) || process.env.NEXT_PUBLIC_DERIV_API_TOKEN || null;
}

export function getStoredLoginid(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(LOGIN_KEY);
}

export function getStoredCurrency(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(CURRENCY_KEY);
}

export function getStoredAccounts(): DerivAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(sessionStorage.getItem(ACCOUNTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LOGIN_KEY);
  sessionStorage.removeItem(CURRENCY_KEY);
  sessionStorage.removeItem(ACCOUNTS_KEY);
}
