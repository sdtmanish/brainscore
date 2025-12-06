import withPWA from "next-pwa";

const nextConfig = {
  reactCompiler: true,

  // 👇 Required for Next.js 16 when using any webpack-based plugin (like next-pwa)
  turbopack: {},        // provide empty config to satisfy Next.js
  webpack: (config) => {
    return config;      // this enables webpack mode
  }
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
})(nextConfig);
