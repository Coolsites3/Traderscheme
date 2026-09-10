import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TraderScheme – Connect. Analyze. Trade.',
  description: 'Real Deriv trading terminal with live market data.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
