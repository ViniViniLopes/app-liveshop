import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better dev-time error catching
  reactStrictMode: true,

  // Transpile monorepo workspace packages
  transpilePackages: ['@liveshop/database', '@liveshop/liquidos-ui'],

  images: {
    remotePatterns: [
      // Supabase Storage (replace with your project ref)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Supabase Storage (custom domain)
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
      // Bling product images CDN
      {
        protocol: 'https',
        hostname: '*.bling.com.br',
      },
      // Placeholder / fallback images
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },

  // Expose safe public env vars to client bundles
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NEXT_PUBLIC_PLATFORM_DOMAIN: process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'liveshop.com.br',
  },

  // API / server-side rewrites
  async rewrites() {
    return [];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
