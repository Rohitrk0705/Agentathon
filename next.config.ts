import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  serverActions: {
    bodySizeLimit: "25mb",
  },
};

export default nextConfig;
