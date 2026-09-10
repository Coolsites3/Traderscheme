/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_DERIV_MARKUP_PERCENT: process.env.NEXT_PUBLIC_DERIV_MARKUP_PERCENT || '3',
  },
};
module.exports = nextConfig;
