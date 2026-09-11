/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@sparticuz/chromium',
        'puppeteer-core',
      ];
    }
    return config;
  },
  typescript: {
    // Mengabaikan error TypeScript saat proses build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Mengabaikan error ESLint saat proses build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;