/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['159.89.232.147'],
  },

  // Добавляем rewrites для API прокси
  async rewrites() {
    return [
      // API прокси - решает проблему Mixed Content
      {
        source: '/api/:path*',
        destination: 'http://159.89.232.147:8000/api/:path*',
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/invite_etno',
        destination: '/admin/kz/invite_etno?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
      {
        source: '/invite_gray',
        destination: '/admin/kz/invite_gray?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
      {
        source: '/invite_photo',
        destination: '/admin/kz/invite_photo?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
      {
        source: '/invite_kz',
        destination: '/admin/kz/invite_kz?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
      {
        source: '/invite_digital',
        destination: '/admin/kz/invite_digital?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
    ];
  },
};

export default nextConfig;