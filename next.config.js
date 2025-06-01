/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@shadcn/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig; 