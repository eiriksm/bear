var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

gulp.task('scripts', function() {
  browserify('./source.js')
    .require('https')
    .bundle()
    .pipe(source('background.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['scripts']);
