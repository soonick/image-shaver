module.exports = function(config) {
  config.set({
    basePath: '../..',
    frameworks: ['mocha', 'proclaim', 'sinon'],
    files: [
      'tests/unit/src/**/*.spec.js',
      'src/**/*.js',
      'tests/unit/fixtures/js/*.js',
      {pattern: 'tests/unit/fixtures/img/*.png', included: false, served: true}
    ],
    reporters: ['progress'],
    port: 9877,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};
