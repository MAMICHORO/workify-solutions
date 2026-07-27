import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 300,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ubaglunjngmcpnmtfemv.supabase.co",
        pathname: "/storage/v1/object/sign/gallery-images/**",
      },
    ],
  },
};

export default nextConfig;
