/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10gb",
    },
  },
  // Production: use npm run build && npm start
};

module.exports = nextConfig;
