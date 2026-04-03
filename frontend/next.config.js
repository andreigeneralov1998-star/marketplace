/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '178.172.136.77',
        port: '4000',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;