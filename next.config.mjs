/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // wagmi/connectors' barrel file transitively pulls in the Coinbase
    // "baseAccount" connector, which optionally depends on @x402/* packages
    // this app doesn't install and never exercises (we only use the
    // injected + walletConnect connectors). Alias them out so the bundler
    // treats them as empty modules instead of failing to resolve them.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402/evm": false,
      "@x402/evm/upto/client": false,
      "@x402/evm/exact/client": false,
      "@x402/svm/exact/client": false,
      "@x402/core/client": false,
      // MetaMask SDK (pulled in by WalletConnect/injected connector chains)
      // optionally supports React Native, which isn't used in a Next.js web
      // app. viem's WebSocket transport also pulls in pino's optional
      // pretty-printer, which is dev-only tooling we don't need bundled.
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
