import type { NextConfig } from "next";
import path from 'path';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@frontend/shared'],
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config = config || {};
    // Ensure resolve.alias exists
    if (!config.resolve) config.resolve = {} as any;
    if (!config.resolve.alias) config.resolve.alias = {} as any;
    // Alias @shared to the local shared src for imports like '@shared/...'
    config.resolve.alias['@shared'] = path.resolve(__dirname, '..', 'shared', 'src');
    return config;
  }
};

const withNextIntl = createNextIntlPlugin(
  "./lib/i18/request.ts"
);

export default withNextIntl(nextConfig);
