var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass')(require('sass'));
var cssnano = require('gulp-cssnano');
var prefix = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cp = require('child_process');

/**
 * Compile and minify sass
 */
function styles() {
  return gulp
    .src([ '_sass/*.scss' ])
    .pipe(
      sass({
        includePaths: [ 'scss' ],
        onError: browserSync.notify
      })
    )
    .pipe(prefix([ 'last 3 versions', '> 1%', 'ie 8' ], { cascade: true }))
    .pipe(rename('main.min.css'))
    .pipe(cssnano())
    .pipe(gulp.dest('_site/assets/css/'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('assets/css'));
}

function stylesVendors() {
  return gulp
    .src([ '_sass/vendors/*.css' ])
    .pipe(concat('vendors.min.css'))
    .pipe(cssnano())
    .pipe(gulp.dest('_site/assets/css/'))
    .pipe(gulp.dest('assets/css'));
}

/**
 * Compile and minify js
 */
function scripts() {
  return gulp
    .src([ '_js/app.js' ])
    .pipe(rename('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('_site/assets/js'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('assets/js'));
}

function scriptsVendors() {
  return gulp
    .src([ '_js/vendors/*.js' ])
    .pipe(concat('vendors.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('_site/assets/js'))
    .pipe(gulp.dest('assets/js'));
}

/**
 * Server functionality handled by BrowserSync
 */
function browserSyncServe(done) {
  browserSync.init({
    server: '_site',
    port: 4000
  });
  done();
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}

/**
 * Check if we are running in a CI environment
 * @returns {boolean}
 */
function isInCI() {
  return process.env.GITHUB_ACTIONS && process.env.GITHUB_ACTIONS.toString() === 'true' ||
    process.env.TRAVIS && process.env.TRAVIS.toString() === 'true' ||
    process.env.CIRCLECI && process.env.CIRCLECI.toString() === 'true' ||
    process.env.JENKINS_URL && process.env.JENKINS_URL.toString() === 'true' ||
    process.env.GITLAB_CI && process.env.GITLAB_CI.toString() === 'true' ||
    process.env.APPVEYOR && process.env.APPVEYOR.toString() === 'True' ||
    process.env.BUILDKITE && process.env.BUILDKITE.toString() === 'true' ||
    process.env.DRONE && process.env.DRONE.toString() === 'true' ||
    process.env.CI && process.env.CI.toString() === 'true';
}

/**
 * Check if we are running in a production environment
 * @returns {boolean}
 */
function isProduction() {
  return process.env.NODE_ENV && process.env.NODE_ENV.toString() === 'production' ||
    process.env.JEKYLL_ENV && process.env.JEKYLL_ENV.toString() === 'production' ||
    process.env.GATSBY_ACTIVE_ENV && process.env.GATSBY_ACTIVE_ENV.toString() === 'production' ||
    process.env.CONTEXT && process.env.CONTEXT.toString() === 'production';
}

/**
 * Get production base URL from JEKYLL_BASE_URL environment variable
 * @returns {string}
 */
function prodBaseURL() {
  return process.env.JEKYLL_BASE_URL ? process.env.JEKYLL_BASE_URL.toString() : '';
}

/**
 * Build Jekyll site
 */
function jekyll(done) {
  console.log('Building Jekyll site');
  console.log('CI: ' + isInCI());
  console.log('Production: ' + isProduction());
  console.log('Base URL: ' + prodBaseURL());
  return cp
    .spawn(
      'bundle',
      [
        'exec',
        'jekyll',
        'build',
        '--incremental',
        '--verbose',
      ].concat(isInCI() && isProduction() ? ['--config=_config.yml', '--baseurl', prodBaseURL()] :
        ['--config=_config.yml,_config_dev.yml']),
      {
        stdio: 'inherit'
      }
    )
    .on('close', done);
}

/**
 * Watch source files for changes & recompile
 * Watch html/md files, run Jekyll & reload BrowserSync
 */
function watchData() {
  gulp.watch(
    [ '_data/*.yml', '_config.yml', 'assets/*.json' ],
    gulp.series(jekyll, browserSyncReload)
  );
}

function watchMarkup() {
  gulp.watch(
    [ 'index.html', '_includes/*.html', '_layouts/*.html' ],
    gulp.series(jekyll, browserSyncReload)
  );
}

function watchScripts() {
  gulp.watch([ '_js/*.js' ], scripts);
}

function watchStyles() {
  gulp.watch([ '_sass/*.scss' ], styles);
}

function watch() {
  gulp.parallel(watchData, watchMarkup, watchScripts, watchStyles);
}

var compile = gulp.parallel(styles, stylesVendors, scripts, scriptsVendors);
var serve = gulp.series(compile, jekyll, browserSyncServe);
var watch = gulp.parallel(watchData, watchMarkup, watchScripts, watchStyles);
var build = gulp.series(compile, jekyll);

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the Jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', gulp.parallel(serve, watch));
gulp.task('build', build);