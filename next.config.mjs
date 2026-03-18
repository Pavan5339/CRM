/** @type {import('next').NextConfig} */
const supabaseStoragePatterns = [
  {
    protocol: 'https',
    hostname: '**.supabase.co',
    pathname: '/storage/v1/object/public/**',
  },
];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const parsedSupabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const isDefaultCloudHost =
      parsedSupabaseUrl.protocol === 'https:' && parsedSupabaseUrl.hostname.endsWith('.supabase.co');

    if (!isDefaultCloudHost) {
      supabaseStoragePatterns.push({
        protocol: parsedSupabaseUrl.protocol.replace(':', ''),
        hostname: parsedSupabaseUrl.hostname,
        ...(parsedSupabaseUrl.port ? { port: parsedSupabaseUrl.port } : {}),
        pathname: '/storage/v1/object/public/**',
      });
    }
  } catch {
    // Ignore malformed NEXT_PUBLIC_SUPABASE_URL and keep default cloud pattern.
  }
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      ...supabaseStoragePatterns,
    ],
  },
};

export default nextConfig;
