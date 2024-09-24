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
        hostname: "medias.musimundo.com",
      },
      {
        protocol: "https",
        hostname: "images.fravega.com",
      },
    ],
  },
};

export default nextConfig;
