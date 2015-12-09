var gulp         = require('gulp');
var path         = require('path');
var sass         = require('gulp-sass');
var browserSync  = require('browser-sync');
var prefix       = require('gulp-autoprefixer');
var concat       = require('gulp-concat');
var minifyCss    = require('gulp-minify-css');
var plumber      = require('gulp-plumber');
var uglify       = require('gulp-uglify');
var rename       = require("gulp-rename");
var imagemin     = require("gulp-imagemin");
var pngquant     = require('imagemin-pngquant');
var rev          = require('gulp-rev-append');
// var cheerio      = require('gulp-cheerio');
var replace      = require('gulp-replace');

var gutil            = require("gulp-util");
var webpack          = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpack_dev_config   = require('./src/js/redux/webpack.dev.config.js');
var webpack_deploy_config = require('./src/js/redux/webpack.deploy.config.js');

var config = {
  app_port: 8080,
  webpack_port: 3000,
  src: 'src/',
  dest: './',
};
var s = function(file_path){
  return path.join(config.src, file_path);
};
var d = function(file_path){
  return path.join(config.dest, file_path);
};
/**
*  concat common css, 
*/
gulp.task('css', function(){
  gulp.src([s('css/normalize.css'), s('css/bs.css')])
  .pipe(concat('common.css'))
  .pipe(minifyCss())
  .pipe(gulp.dest(d('css')));
});
/**
*
* Styles
* - Compile
* - Compress/Minify
* - Catch errors (gulp-plumber)
* - Autoprefixer
*
**/
gulp.task('sass', function() {
  gulp.src(s('sass/style.sass'))
  .pipe(plumber())
  //compressed
  .pipe(sass({outputStyle: ''}))
  .pipe(prefix('last 2 versions', '> 1%', 'ie 8', 'Android 2', 'Firefox ESR'))
  .pipe(plumber())
  .pipe(gulp.dest(d('css')));
});

/**
*
* BrowserSync.io
* - Watch CSS, JS & HTML for changes
* - View project at: localhost:3000
*
**/
gulp.task('browser-sync', function() {
  browserSync.init(['css/*.css', 'js/*.js', 'index.html'], {
    server: {
      baseDir: './'
    },
    port: config.app_port,
    reloadOnRestart: true,
    open: false
  });
});


/**
*
* Javascript
* - Uglify
*
**/
function compile_js(){
  gulp.src(s('js/*.js'))
  .pipe(uglify())
  .pipe(rename({
    // dirname: "min",
    suffix: ".min",
  }))
  .pipe(gulp.dest(d('js')));
}
gulp.task('scripts', compile_js);

gulp.task('template:pre', function(){
  var wds_server = "http://localhost:3000/"
  gulp.src(s('index.html'))
    .pipe(replace(/\{\{app\.js\}\}/, wds_server + 'app.js'))
    .pipe(replace(/\{\{webpack-dev-server\.js\}\}/, '<script src="' + wds_server + 'webpack-dev-server.js"></script>'))
    .pipe(gulp.dest('./'));
});

function template_deploy(){
  gulp.src(s('index.html'))
    .pipe(replace(/\{\{app\.js\}\}/, 'js/app.min.js?rev=@@hash'))
    .pipe(replace(/\{\{webpack-dev-server\.js\}\}/, ''))
    .pipe(rev())
    .pipe(gulp.dest('./'));
}
gulp.task('template:deploy', template_deploy);

function add_rev(){
  gulp.src('./index.html')
    .pipe(rev())
    .pipe(gulp.dest('.'));
}
// gulp.task('template:rev', ['template:deploy']);
// gulp.task('rev', add_rev);
/**
*
* Images
* - Compress them!
*
**/
gulp.task('images', function () {
  return gulp.src(s('images/*'))
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(gulp.dest(d('images')));
});

//@1: 第一步操作
gulp.task("webpack-dev-server", function(callback) {
  var port = config.webpack_port;
  webpack_dev_config.entry.unshift(
    "webpack-dev-server/client?http://localhost:" + port,
    'webpack/hot/only-dev-server');

  new WebpackDevServer(webpack(webpack_dev_config), {
    hot: true,
    noInfo: true,
    colors: true,
    contentBase: 'xxxxxx'
  }).listen(config.webpack_port, "localhost", function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", "http://localhost:"+ port);
  });
});

gulp.task("webpack:react", function(callback) {
    // run webpack
  webpack(webpack_deploy_config, function(err, stats) {
    if(err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
        // output options
    }));
    
    callback();
  });
});
gulp.task("webpack:compile_js", ["webpack:react"], compile_js);
gulp.task("webpack:template_deploy", ["webpack:compile_js"], template_deploy);
gulp.task("deploy:rev", ["webpack:template_deploy"], function(){
  setTimeout(add_rev, 1000);
});
/**
*
* Default task
* - Runs sass, browser-sync, scripts and image tasks
* - Watchs for file changes for images, scripts and sass/css
*
**/
//@2: 第二步操作
gulp.task('default', ['css', 'sass', 'scripts', 'images', 'template:pre', 'browser-sync'], function () {
  gulp.watch(s('sass/**/*.sass'), ['sass']);
  gulp.watch(s('js/*.js'), ['scripts']);
  gulp.watch(s('images/*'), ['images']);
  gulp.watch(s('css/*.css'), ['css']);
});

gulp.task('deploy', ['webpack:react', 'webpack:compile_js', 'webpack:template_deploy', "deploy:rev"]);