/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Changé pour avoir de vrais warnings
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone', // Optimisation pour Vercel
}

export default nextConfig