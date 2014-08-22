var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

gulp.task('scripts', function() {
  browserify('./browser.js')
    .require('https')
    .bundle()
    .pipe(source('background.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('*.js', ['scripts']);

});

gulp.task('default', ['scripts']);
