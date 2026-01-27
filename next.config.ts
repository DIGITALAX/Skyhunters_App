import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Disable Next.js telemetry without touching .env files.
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
  },
  // Non-standard but explicit for audits/tools.
  telemetry: false as unknown as boolean,
};

export default nextConfig;
