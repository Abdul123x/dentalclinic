import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Mongoose must run on the Node.js runtime, never bundled for the edge.
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
