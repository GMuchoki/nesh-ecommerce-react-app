import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phones/devices on the local network to connect for development without triggering infinite WebSocket retries
  allowedDevOrigins: ['192.168.8.71', 'localhost'],
};

export default nextConfig;
