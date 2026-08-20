/** @type {import('next').NextConfig} */
const nextConfig = {
  // Jika ingin static export: output: 'export',
  // Jika untuk Vercel / Node server: output: 'standalone',
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