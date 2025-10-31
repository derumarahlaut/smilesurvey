
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  webpack: (config, { isServer }) => {
    // Minimal webpack config to avoid infinite loops
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Remove complex optimizations that might cause loops
    config.optimization = {
      ...config.optimization,
      sideEffects: false,
      usedExports: true,
    };

    return config;
  },
};

export default nextConfig;
