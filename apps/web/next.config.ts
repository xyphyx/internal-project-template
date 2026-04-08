import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@xyphyx/shared"],
  output: "standalone",
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
