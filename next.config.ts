import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // รองรับไฟล์แนบสูงสุด 50 MB
    },
  },
};

export default nextConfig;
