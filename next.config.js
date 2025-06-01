/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'api.mapbox.com',
      'tile.openstreetmap.org',
      'basemaps.cartocdn.com',
    ],
    formats: ['image/webp'],
  },
}

module.exports = nextConfig
