import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // experimental.inlineCss 는 시험 후 되돌림: CSS가 <style>과 RSC 데이터에 두 번 들어가 HTML(gzip)이 26KB → 100KB, 성능 점수가 오히려 하락
  images: {
    // 영웅 원본 PNG(680×961, 약 1MB)를 webp/avif로 줄여서 제공
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    localPatterns: [{ pathname: "/images/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
