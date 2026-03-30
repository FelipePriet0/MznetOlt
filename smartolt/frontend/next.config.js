/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  // favicon é servido agora a partir de public/favicon.ico
  async redirects() {
    return [
      {
        source: '/onus/configured',
        destination: '/onus/configuradas',
        permanent: true,
      },
      {
        source: '/onus/unconfigured',
        destination: '/onus/naoconfiguradas',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;
