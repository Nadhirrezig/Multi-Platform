import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/app/*": ["src/app/*"]
      },
      // Add additional properties here if needed
  }
};

export default nextConfig;
