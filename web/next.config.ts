import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("./package.json") as { version: string };

const nextConfig: NextConfig = {
  env: {
    // Injected at build time from package.json — use process.env.NEXT_PUBLIC_WEB_VERSION in client code.
    NEXT_PUBLIC_WEB_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
