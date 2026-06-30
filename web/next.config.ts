import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("./package.json") as { version: string };

const nextConfig: NextConfig = {
  env: {
    // Prefer the version passed by build.sh via NEXT_PUBLIC_APP_VERSION env var;
    // fall back to package.json version for local `npm run build`.
    NEXT_PUBLIC_WEB_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? pkg.version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
