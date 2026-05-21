import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@frontend/shared'],
};

const withNextIntl = createNextIntlPlugin(
  "./lib/i18/request.ts"
);

export default withNextIntl(nextConfig);
