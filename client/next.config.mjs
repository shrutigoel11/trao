import path from "node:path";
import { fileURLToPath } from "node:url";

const clientRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  // Keep Next's file tracing inside this app instead of inferring the parent
  // directory from unrelated lockfiles.
  outputFileTracingRoot: clientRoot,
};
export default nextConfig;
