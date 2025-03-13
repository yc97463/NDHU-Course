import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isProd ? "/ndhu-course-crawler" : "",
  assetPrefix: isProd ? "/ndhu-course-crawler/" : "",
};

export default nextConfig;
