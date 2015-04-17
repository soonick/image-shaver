var gulp = require('gulp');
var karma = require('karma').server;
var path = require('path');

var config = {
  configFile: path.join(__dirname, '../tests/unit/karma.conf.js')
};

gulp.task('karma', function(done) {
  karma.start(config, done);
});
