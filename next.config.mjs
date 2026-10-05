/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // /api/products が読む商品データをサーバー関数に同梱する
  outputFileTracingIncludes: {
    '/api/products': ['./public/data/unified.json'],
  },
}

export default nextConfig
