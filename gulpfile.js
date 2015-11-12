var streamqueue = require('streamqueue');
var gulp        = require('gulp');
var gutil       = require('gulp-util');
var concat      = require('gulp-concat');
var less        = require('gulp-less');
var jshint      = require('gulp-jshint');
var uglify      = require('gulp-uglify');
var minifyCss   = require('gulp-minify-css');
var livereload  = require('gulp-livereload');
var babel       = require('gulp-babel');

var appName     = 'myModule';
var app         = 'src';
var dist        = 'dist';

var env         = (gutil.env.env === 'production') ? gutil.env.env : 'development';

gutil.log('Building of the ' + env + ' environment.');

var paths = {
  js: {
    libs: [],
    src: [ app + '/**/*.js' ]
  },
  css: [],
  less: [ app + '/**/*.less' ]
};

gulp.task('jshint', function () {
  return gulp.src(paths.js.src)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js', function() {
  var stream = streamqueue({ objectMode: true });

  stream.queue(
    gulp.src(paths.js.src)
      .pipe(concat('src.js'))
    );

  return stream.done()
    .pipe(concat(env === 'production' ? appName + '.min.js' : appName + '.js'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(env === 'production' ? uglify({mangle: false}) : gutil.noop())
    .pipe(gulp.dest(dist + '/'))
    .pipe(livereload());
});

gulp.task('styles', function () {
  var stream = streamqueue({ objectMode: true });

  stream.queue(
    gulp.src(paths.css)
      .pipe(concat('styles.css'))
  );

  stream.queue(
    gulp.src(paths.less)
      .pipe(concat('styles.less'))
      .pipe(less())
  );

  return stream.done()
    .pipe(concat(env === 'production' ? appName + '.min.css' : appName + '.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest(dist + '/'))
    .pipe(livereload());
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(paths.js.src, ['js']);
  gulp.watch(paths.less, ['styles']);
});

gulp.task('default', ['jshint','js','styles']);
