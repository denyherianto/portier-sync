import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['better-sqlite3'],
  output: 'standalone',
};

export default nextConfig;
