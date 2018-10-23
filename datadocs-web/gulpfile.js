const gulp = require('gulp');
const concatCss = require('gulp-concat-css');
const cleanCss = require('gulp-clean-css');
const exec = require('gulp-exec');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const change = require('gulp-change');
const es = require('event-stream');
const clean = require('gulp-clean');
const gulpsync = require('gulp-sync')(gulp);
const git = require('git-rev');
const dateFormat = require('dateformat');
const templateCache = require('gulp-angular-templatecache');
const htmlmin = require('gulp-htmlmin');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const connect = require('gulp-connect');
const modRewrite = require('connect-modrewrite');
const proxy = require('http-proxy-middleware');
const watch = require('gulp-watch');
const browserSync = require('browser-sync').create();
const gp_notify = require('gulp-notify');
const os = require('os');
var reload      = browserSync.reload;


// Specify whether the backend exists locally (localhost:9100) or remote (dev.datadocs.com)
var hostsToUseLocalJavaBackend = ["LA-DEV-IM-MMx", "add-your-hostname-here"]

if (hostsToUseLocalJavaBackend.indexOf(os.hostname()) != -1) {
	useLocalJavaBackend = true;
} else {
	useLocalJavaBackend = false;
}


if (useLocalJavaBackend) {
    var changeOrigin = false;
	var WebURL = "http://localhost:9100";
	var SocketURL = "ws://localhost:9100";
} else {
    var changeOrigin = true;
	var WebURL = "https://dev.datadocs.com";
	var SocketURL = "https://dev.datadocs.com";
}

const assetsPath = "./src/";

let watching = false;
function swallowError (error) {
  if(watching) {
    console.log(error.toString());
    this.emit('end');
  } else {
    throw error;
  }
}

function changeCssPath(content){
  return content.replace(/static\/build\/css\/build\.css/g, 'static/css/build.css');
}

function setCacheTime(content){
  return content.replace(/%timestamp%/g, Math.round(new Date().getTime() / 1000));
}

function repeat(str, times) {
    return new Array(times + 1).join(str);
}

function setDeploymentInfo(content, done){
  git.short(function (rev) {
    content = content.replace(/%revision%/g, rev).replace(/%upload-date%/g, dateFormat());
    done(null, content)
  });
}

gulp.task('copy-fonts', function(){
  // copy fonts into build dir
  gulp
    .src([assetsPath + 'css/lib/**/*.{ttf,woff,woff2,eot,svg}'])
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest('build/static/css/'));
});

gulp.task('copy-files', ['copy-fonts'], function(){
  return es.merge(
    // copy excluded libs into build dir
    gulp.
      src([assetsPath + 'js/lib/html2canvas.js']).
      pipe(gulp.dest('build/js/lib/')),
    // copy other resources
    gulp.
      src([
        assetsPath + '/**/*',
        '!' + assetsPath + "/css/**/*",
        '!' + assetsPath + "/js/**/*",
        '!' + assetsPath + "/fonts/**/*"]).
      pipe(gulp.dest('build'))
  );
});

gulp.task('edit-files', function(){
    // change path to css in index.html and embed.html
  gulp
    .src(['build/index.html', 'build/embed.html'])
    .pipe(change(changeCssPath))
    .pipe(change(setCacheTime))
    .pipe(gulp.dest('build/'));

  gulp
    .src(['build/templates/auth/login.html'])
    .pipe(change(setDeploymentInfo))
    .pipe(gulp.dest('build/static/templates/auth'));
});

gulp.task('preset-modules-timestamp', function() {
  // set timestamp-based parameter to add to script paths (clears cache)
  gulp
    .src('build/js/main.js')
    .pipe(change(setCacheTime))
    .pipe(gulp.dest('build/static/js/'));

  gulp
    .src('build/js/**/*')
    .pipe(gulp.dest('build/static/js/'));

  gulp
    .src('build/img/**/*')
    .pipe(gulp.dest('build/static/img/'));
});

gulp.task('sass', function () {
  return gulp
    .src(assetsPath + 'css/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('build/static/css/'));
});

gulp.task('css', ['sass'], function () {
  return gulp
    .src([assetsPath + 'css/lib/**/*.css', assetsPath + 'css/custom/**/*.css', 'build/static/css/main.css'])
    .pipe(concatCss('build.css'))
    .on('error', swallowError)
    .pipe(cleanCss({ level: 2 }))
    .on('error', swallowError)
    .pipe(gulp.dest('build/static/css/'));
});

gulp.task('clean', function () {
  return gulp.src('build', {read: false}).pipe(clean());
});

gulp.task('js', function () {
  return gulp.src('.').pipe(exec('./node_modules/requirejs/bin/r.js -o rconfig.js'));
});

gulp.task("babel", function () {
  return gulp
    .src(['./build/js/**/*.js', '!./build/js/lib'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: [
        ['env', {
          targets: {
            'browsers': ['safari >= 10', 'ie >= 10', 'last 2 versions']
          },
          // RequireJS is the main bundler, don't transform AMD modules at all
          modules: false
        }],

        // Without these settings file modules/main/filters/size.js won't work
        ['minify',  { mangle: false, evaluate: false }]
      ]
    }))
    .pipe(sourcemaps.write('maps'))
    .on('error', swallowError)
    .pipe(gulp.dest('./build/static/js'));
});

gulp.task('templates-html-minify', function() {
  return gulp
    .src('build/templates/**/*.html')
    .pipe(htmlmin({
      collapseBooleanAttributes: false,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      minifyCSS: true,
      minifyJS: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true
    }))
    .on('error', swallowError)
    .pipe(gulp.dest('build/static/templates/'));
});

gulp.task('templates-app', function() {
  return gulp
    .src('build/templates/app/**/*.html')
    .pipe(
      templateCache('templates-app.js',
      { 
        module: 'templates-app', standalone: true, moduleSystem: 'RequireJS', root: 'static/templates/app' 
      }))
    .on('error', swallowError)
    .pipe(gulp.dest('build/static/js/cached-templates'));
});

gulp.task('templates-main', function() {
  return gulp
    .src('build/templates/main/**/*.html')
    .pipe(
      templateCache('templates-main.js',
      { 
        module: 'templates-main', standalone: true, 
        moduleSystem: 'RequireJS', root: '/static/templates/main' 
      }))
    .on('error', swallowError)
    .pipe(gulp.dest('build/static/js/cached-templates'));
});

gulp.task('templates-include', function() {
  return gulp
    .src('build/templates/include/**/*.html')
    .pipe(templateCache('templates-include.js', {
      module: 'templates-include', standalone: true, moduleSystem: 'RequireJS', root: 'static/templates/include' }))
    .on('error', swallowError)
    .pipe(gulp.dest('build/static/js/cached-templates'));
});

gulp.task('templates-auth', function() {
  return gulp
    .src('build/templates/auth/**/*.html')
    .pipe(templateCache('templates-auth.js',
      { module: 'templates-auth', standalone: true, moduleSystem: 'RequireJS', root: '/static/templates/auth' }))
    .on('error', swallowError)
    .pipe(gulp.dest('build/static/js/cached-templates'));
});

gulp.task('release', gulpsync.sync([
  'clean',
  'css',
  'copy-files',
  'edit-files',
  'templates-html-minify',
  'templates-app',
  'templates-include',
  'templates-main',
  'templates-auth',
  'js',
//  'babel',
  'preset-modules-timestamp'
]));

gulp.task('update-build', gulpsync.sync([
  'clean',
  'css',
  'copy-files',
  'edit-files',
  'templates-html-minify',
  'templates-app',
  'templates-include',
  'templates-main',
  'templates-auth',
  'js',
//  'babel',
  'preset-modules-timestamp'
]));

gulp.task('server', function() {
  connect.server({ 
    root: 'build/',
    port: 8283,
    host: '0.0.0.0',
    //livereload: true,
    debug: true,

    middleware: function() {
      return [
        modRewrite([
          '^/(.*)$ /$1 [L]',
        ]),
        proxy('/api', {
          target: WebURL,
          changeOrigin: changeOrigin
        }),
         proxy('/share', {
          target: WebURL,
          changeOrigin: changeOrigin
        }),
        proxy('/websocket', {
          target: SocketURL,
          changeOrigin:true,
          ws: true      // <-- set it to 'true' to proxy WebSockets
        })
      ];
    }
  });
});

gulp.task('watch-and-reload', ['update-build'], function() {
  watch(['src/**'], {interval: 1000, usePolling: true} , function() {
    gulp.start('update-build');
  })
  .pipe(connect.reload()).pipe(reload({stream: true}));
});

gulp.task('watch', ['update-build', 'watch-and-reload', 'server'], function(){
    gp_notify("\n\n\n"
			  + repeat('************************************************\n', 3) 
			  + "WEBSERVER IS READY!\n"
			  + "Go to http://localhost:8283\n"
			  + "(Backend configured at " + WebURL + ")\n"
			  + repeat('************************************************\n', 3) 
			  + "\n\n\n"
		    ).write('');
});

