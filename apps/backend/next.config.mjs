import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: require.resolve('next/dist/compiled/react'),
      'react-dom': require.resolve('next/dist/compiled/react-dom'),
    };
    return config;
  },
};

export default nextConfig;
