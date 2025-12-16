import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  // Webpack configuration for builds
  webpack: (config, { isServer }) => {
    // Ignore problematic modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Ignore test files and test dependencies from node_modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'tap': false,
      'tape': false,
      'desm': false,
      'fastbench': false,
      'pino-elasticsearch': false,
      'pino-pretty': false,
      'why-is-node-running': false,
    };

    // Use IgnorePlugin to ignore test files and non-essential files
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test\//,
        contextRegExp: /thread-stream/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/bench\.js$/,
        contextRegExp: /thread-stream/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/README\.md$/,
        contextRegExp: /thread-stream/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/LICENSE$/,
        contextRegExp: /thread-stream/,
      })
    );

    return config;
  },
};

export default nextConfig;
