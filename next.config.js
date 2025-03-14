const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,

      fs: false, // the solution
    };

    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      layers: true,
    };

    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
    };

    config.module.rules.push({
      test: /\.csv$/,
      loader: "csv-loader",
      options: {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true,
      },
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "uenji-file-uploads.s3.eu-north-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "places.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "*.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "fastly.4sqi.net",
        pathname: "/img/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts - add Google Maps, Mapbox, and other trusted sources
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.google.com https://*.gstatic.com https://api.mapbox.com https://*.mapbox.com",
              // Styles - add Mapbox
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com https://*.mapbox.com",
              // Images - allow Cloudinary, Google, AWS S3, and other image sources
              "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://res.cloudinary.com https://lh3.googleusercontent.com https://uenji-file-uploads.s3.eu-north-1.amazonaws.com https://places.googleapis.com https://images.unsplash.com https://api.mapbox.com https://*.mapbox.com https://fastly.4sqi.net",
              // Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Connect sources for APIs
              "connect-src 'self' https://*.googleapis.com https://api.openai.com https://api.unsplash.com https://api.mapbox.com https://*.mapbox.com https://events.mapbox.com https://api.foursquare.com",
              // Frame sources for embedded content
              "frame-src 'self' https://*.google.com",
              // Media sources
              "media-src 'self'",
              // Object sources
              "object-src 'none'",
              // Worker sources - needed for Mapbox
              "worker-src 'self' blob:",
            ].join("; "),
          },
          // CORS headers
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3014",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          // Additional security headers
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
      {
        // Special headers for API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3014",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
