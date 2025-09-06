import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy all /api/* calls to your AWS API Gateway
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://93m0onrfyi.execute-api.us-east-1.amazonaws.com/prod/api/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
