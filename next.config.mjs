/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'naldoar.vtexassets.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
}

export default nextConfig;
