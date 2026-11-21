/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static site in out/, served by a Cloudflare Worker (wrangler.jsonc)
  output: 'export',
};

export default nextConfig;
