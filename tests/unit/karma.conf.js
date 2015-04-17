module.exports = function(config) {
  config.set({
    basePath: '../..',
    frameworks: ['mocha'],
    files: [
      'tests/unit/src/**/*.spec.js',
      'src/**/*.js'
    ],
    reporters: ['progress'],
    port: 9877,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};
