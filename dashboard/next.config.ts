import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Externe native Module für better-sqlite3
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
