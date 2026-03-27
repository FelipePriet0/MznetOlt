/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  // favicon é servido agora a partir de public/favicon.ico
};

module.exports = nextConfig;
