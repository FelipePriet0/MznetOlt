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
      {
        source: '/authorization',
        destination: '/autorizacao',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/configuracoes',
        permanent: true,
      },
      {
        source: '/olts/new',
        destination: '/olts/adicionar',
        permanent: true,
      },
      {
        source: '/olts/:id/edit',
        destination: '/olts/:id/editar',
        permanent: true,
      },
      {
        source: '/olts/:id/history',
        destination: '/olts/:id/historico',
        permanent: true,
      },
      {
        source: '/olts/:id/advanced',
        destination: '/olts/:id/avancado',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;
