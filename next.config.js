/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['fal.media', 'v3.fal.media'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media',
        port: '',
        pathname: '/files/**',
      },
      {
        protocol: 'https',
        hostname: 'v3.fal.media',
        port: '',
        pathname: '/files/**',
      },
    ],
  },
}

module.exports = nextConfig
