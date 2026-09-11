/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/@sparticuz/chromium/bin/**'],
      '/admin/reports/**/*': ['./node_modules/@sparticuz/chromium/bin/**'],
      '/reports/**/*': ['./node_modules/@sparticuz/chromium/bin/**'],
    },
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