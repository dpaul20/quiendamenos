/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "naldoar.vtexassets.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "www.cetrogar.com.ar",
      },
      {
        protocol: "https",
        hostname: "**.musimundo.com",
        pathname: '/medias/**',
      },
      {
        protocol: "https",
        hostname: "images.fravega.com",
      },
      {
        protocol: "https",
        hostname: "cdn.cafecito.app",
      },
    ],
  },
};

export default nextConfig;
