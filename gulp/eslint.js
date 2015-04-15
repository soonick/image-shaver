var eslint = require('gulp-eslint');
var gulp = require('gulp');

var files = [
  'gulpfile.js',
  'gulp/',
  'src/'
];

gulp.task('eslint', function(cb) {
  gulp.src(files)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failOnError())
      .on('error', function(e) {
        cb(e);
      });
});
