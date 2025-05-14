/** @type {import('next').NextConfig} */
const nextConfig = {
  //   devIndicators: false,
  env: {
    TEST: process.env.TEST,
  },
  devIndicators: false,
  images: {
    domains: ["github.com", "avatars.githubusercontent.com"],
  },
};

export default nextConfig;
