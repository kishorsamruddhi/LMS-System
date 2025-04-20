/** @type {import('next').NextConfig} */
const nextConfig = {
  //   devIndicators: false,
  env: {
    TEST: process.env.TEST,
  },
};

export default nextConfig;
