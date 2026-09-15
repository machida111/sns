/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // next/image を使用しておらず、組み込みのImage Optimization APIも不要なため無効化する
  // (Next.js 14系のAVIF処理に関する既知の脆弱性 GHSA-2xp9-vwfh-vxw4 の影響面を減らすため)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
