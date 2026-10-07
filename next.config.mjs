/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/teaching",
        destination: "/dashboard/protocolos",
        permanent: true,
      },
      {
        source: "/dashboard/teaching/new",
        destination: "/dashboard/protocolos/new",
        permanent: true,
      },
      {
        source: "/dashboard/teaching/:slug*",
        destination: "/dashboard/protocolos/:slug*",
        permanent: true,
      },
      {
        source: "/courses",
        destination: "/procedimientos",
        permanent: true,
      },
      {
        source: "/courses/:slug*",
        destination: "/procedimientos/:slug*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
