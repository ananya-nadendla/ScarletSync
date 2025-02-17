module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.resolve.fallback = {
          ...webpackConfig.resolve.fallback,
          fs: false,
          child_process: false
        };
        return webpackConfig;
      },
    },
  };