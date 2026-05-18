/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.GITHUB_ACTIONS ? '/clever-mitsumori' : '',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
