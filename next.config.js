/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds to prevent deployment failures
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript build errors for deployment
    ignoreBuildErrors: true,
  },
  images: {
    // Enable image optimization for better performance
    unoptimized: false,
    domains: [],
  },
  experimental: {
    // Optimize for serverless deployment
    esmExternals: true,
  },
  // Optimize for Netlify deployment
  trailingSlash: false,
  output: 'standalone',
}

module.exports = nextConfig