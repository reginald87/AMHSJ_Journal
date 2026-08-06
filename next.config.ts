import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth"],
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
