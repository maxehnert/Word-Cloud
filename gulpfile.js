'use strict';

// Require your modules
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var rimraf = require('rimraf');
var exec = require('child_process').exec;
var prompt = require('gulp-prompt');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var critical = require('critical');
var babel = require("gulp-babel");

gulp.task('compress', function() {
  return gulp.src('app/scripts/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
////////////////////////////////////////////////////////////
// Transpile babel first before starting serve
// gulp.task('babel', () => {
//   return gulp.src(['app/scripts/**/*.js'])
//     .pipe($.sourcemaps.init())
//     .pipe($.babel())
//     .pipe($.sourcemaps.write())
//     .pipe(gulp.dest('.tmp/scripts'))
//     .pipe(reload({stream: true}));
// });
gulp.task("babel", function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(gulp.dest("dist"));
});
////////////////////////////////////////////////////////////

gulp.task('styles', function () {
  return gulp.src(['app/styles/main.scss', 'app/styles/*.css'])
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'compressed',
      precision: 10
    }))
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('html', ['styles'], function () {

  return gulp.src('app/*.html')
    .pipe($.useref.assets({searchPath: ['.tmp', 'app', '.']})) 
    .pipe($.if('*.css', $.csso()))
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src(['app/*.*', '!app/*.html'], {dot: true})
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function (cb) {
  return $.cache.clearAll(cb, function() {
    return rimraf('.tmp', function () {
      return rimraf('dist', cb);
    });
  });
});

gulp.task('connect', function () {
  var connect = require('connect');
  var app = connect()
    .use(require('connect-livereload')({port: 35729}))
    .use(connect.static('app'))
    .use(connect.static('.tmp'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', connect.static('bower_components'))
    .use(connect.directory('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'styles'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep({directory: 'bower_components'}))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      directory: 'bower_components'
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    '.tmp/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('copystyles', function () {
    return gulp.src(['dist/styles/main.css'])
        .pipe($.rename({
            basename: "site" // site.css
        }))
        .pipe(gulp.dest('dist/styles'));
});

// Generate & Inline Critical-path CSS
gulp.task('critical', ['build', 'copystyles'], function (cb) {

    // At this point, we have our
    // production styles in main/styles.css

    // As we're going to overwrite this with
    // our critical-path CSS let's create a copy
    // of our site-wide styles so we can async
    // load them in later. We do this with
    // 'copystyles' above

    critical.generate({
        base: 'dist/',
        src: 'index.html',
        dest: 'styles/site.css',
        width: 320,
        height: 480,
        minify: true
    }, function(err, output){
        critical.inline({
            base: 'dist/',
            src: 'index.html',
            dest: 'index-critical.html',
            minify: true
        });
    });
});


// Push a subtree from our `dist` folder
gulp.task('deploy', function() {

  gulp.src('/')
    .pipe(prompt.prompt({
        type: 'confirm',
        name: 'task',
        message: 'This will deploy to GitHub Pages. Have you already built your application and pushed your updated master branch?'
    }, function(res){
      if (res.task){
        console.log('Attempting: "git subtree push --prefix dist origin gh-pages"');
        exec('git subtree push --prefix dist origin gh-pages', function(err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
        });
      } else { console.log('Please do this first and then run `gulp deploy` again.'); }
    }));

});

// Test your app in the browser
// Needs to be better, but needed something quick
gulp.task('test-server', function() {

  // Open Test Page
  var connect = require('connect');
  var app = connect()
    .use(require('connect-livereload')({port: 35729}))
    .use(connect.static('test'))
    .use('/app', connect.static('app'))
    .use('/bower_components', connect.static('bower_components'))
    .use(connect.directory('test'));

  require('http').createServer(app)
    .listen(8000)
    .on('listening', function () {
      console.log('Started connect testing server on http://localhost:8000');
    });

  require('opn')('http://localhost:8000');

  // Watch for changes in either the test/spec folder or app/scripts folder
  $.livereload.listen();

  gulp.watch([
    'app/scripts/**/*.js',
    'test/spec/**/*.js'
  ]).on('change', $.livereload.changed);

});
