import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // CSS(약 25KB, Tailwind)를 <style>로 HTML에 넣어 렌더 차단 요청을 없앰 — Lighthouse 느린 4G에서 FCP 약 2.5초 지연의 원인
    inlineCss: true,
  },
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
