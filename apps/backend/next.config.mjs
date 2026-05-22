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
  // Add Turbopack configuration to silence the warning and potentially resolve build issues
  turbopack: {},
};

export default nextConfig;
