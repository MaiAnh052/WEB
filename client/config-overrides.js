const path = require('path');

// Patch crypto for Node.js 17+ compatibility
// This must run before webpack uses crypto
try {
  const crypto = require('crypto');
  const originalCreateHash = crypto.createHash;
  crypto.createHash = function(algorithm) {
    if (algorithm === 'md4') {
      return originalCreateHash.call(this, 'md5');
    }
    return originalCreateHash.call(this, algorithm);
  };
} catch (e) {
  // Ignore if crypto is not available
}

module.exports = function override(config, env) {
  // Also update webpack's hash function (webpack 4 compatible)
  if (config.optimization) {
    config.optimization.moduleIds = 'hashed';
  }

  // Fix "process is not defined" error (webpack 4 compatible)
  // React Scripts already handles process.env, but some third-party libs might need it
  const webpack = require('webpack');
  if (!config.plugins) {
    config.plugins = [];
  }
  
  // Ensure process.env is defined
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    })
  );

  // Add babel plugins
  const babelLoader = config.module.rules.find(
    rule => rule.oneOf !== undefined
  );

  if (babelLoader) {
    const babelRule = babelLoader.oneOf.find(
      rule => rule.test && rule.test.toString().includes('jsx')
    );

    if (babelRule && babelRule.options) {
      if (!babelRule.options.plugins) {
        babelRule.options.plugins = [];
      }
      babelRule.options.plugins.push(
        require.resolve('@babel/plugin-transform-nullish-coalescing-operator'),
        require.resolve('@babel/plugin-transform-optional-chaining')
      );
    }
  }

  // Transpile node_modules/@rc-component
  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    include: /node_modules[\\/]@rc-component/,
    use: {
      loader: require.resolve('babel-loader'),
      options: {
        presets: [
          require.resolve('babel-preset-react-app'),
        ],
        plugins: [
          require.resolve('@babel/plugin-transform-nullish-coalescing-operator'),
          require.resolve('@babel/plugin-transform-optional-chaining'),
        ],
        cacheDirectory: true,
        cacheCompression: false,
        compact: false,
      },
    },
  });

  return config;
};

