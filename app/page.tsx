'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(t);
  }, []);

  function connect() {
    if (!token.trim()) return;
    sessionStorage.setItem('deriv_token', token.trim());
    window.location.href = '/dashboard';
  }

  if (booting) {
    return (
      <main style={{ minHeight: '100vh', background: '#02010a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <h1>TraderScheme</h1>
          <p>Initializing D-Bot...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#02010a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h1>TraderScheme</h1>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Deriv API token"
          style={{ width: '100%', padding: 12, margin: '12px 0' }}
        />
        <button onClick={connect} style={{ width: '100%', padding: 14, fontWeight: 700 }}>
          CONNECT WITH TOKEN
        </button>
      </div>
    </main>
  );
}
