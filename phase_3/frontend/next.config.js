/**
 * Task: T010 | Spec: Constitution VI - Frontend Configuration
 * Description: Next.js configuration with environment variable setup
 * Purpose: Configure Next.js for API integration and static export (optional)
 */

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use frontend dir as workspace root (avoids "multiple lockfiles" warning in monorepo)
  outputFileTracingRoot: path.join(__dirname),

  // Enable React strict mode for development
  reactStrictMode: true,

  // Image optimization
  images: {
    unoptimized: true, // Disable Next.js image optimization for simplicity
  },

  // Environment variables
  env: {
    // Public environment variables (prefixed with NEXT_PUBLIC_)
    // These are embedded at build time
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ayeshamughal2513-focus-hub.hf.space',
    NEXT_PUBLIC_BETTER_AUTH_URL:
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'https://ayeshamughal2513-focus-hub.hf.space/api/v1/auth',
  },

  // Webpack configuration for development
  webpack: (config, { dev }) => {
    // Add any custom webpack configuration here
    return config;
  },

  // Headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },

  // Rewrites for API proxy (optional)
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ayeshamughal2513-focus-hub.hf.space';
    return {
      beforeFiles: [
        // Proxy /api/* to backend
        {
          source: '/api/:path*',
          destination: `${apiBase}/api/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
