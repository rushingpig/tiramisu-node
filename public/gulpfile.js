var gulp                   = require('gulp');
var path                   = require('path');
var fs                     = require('fs');
var sass                   = require('gulp-sass');
var browserSync            = require('browser-sync');
var prefix                 = require('gulp-autoprefixer');
var concat                 = require('gulp-concat');
var minifyCss              = require('gulp-minify-css');
var plumber                = require('gulp-plumber');
var uglify                 = require('gulp-uglify');
var rename                 = require("gulp-rename");
var imagemin               = require("gulp-imagemin");
var pngquant               = require('imagemin-pngquant');
// var jpgmin                 = require('imagemin-jpeg-recompress'); //linux上有问题，
var rev                    = require('gulp-rev-append');
var gulpSequence           = require('gulp-sequence')
var replace                = require('gulp-replace');
var template               = require('gulp-template');

var gutil                  = require("gulp-util");
var webpack                = require("webpack");
var WebpackDevServer       = require("webpack-dev-server");
var webpack_dev_config     = require('./webpack.dev.config.js');
var webpack_deploy_config  = require('./webpack.deploy.config.js');

var config = {
  app_port: 8080,
  webpack_port: 3000,
  node_port: 3001,
  root: '/',  //资源路径
  src: 'src/',
  dest: './',
  views: '../views/'
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
  gulp.src(s('css/*.css'))
  .pipe(minifyCss())
  .pipe(rename({
    suffix: ".min",
  }))
  .pipe(gulp.dest(d('css')));
});

gulp.task('sass', function() {
  gulp.src(s('sass/style.sass'))
  .pipe(plumber())
  //compressed
  .pipe(sass().on('error', sass.logError))
  .pipe(prefix('last 2 versions', '> 1%', 'ie 8', 'Android 2', 'Firefox ESR'))
  .pipe(plumber())
  .pipe(minifyCss())
  .pipe(rename({
    suffix: ".min",
  }))
  .pipe(gulp.dest(d('css')));
});

gulp.task('browser-sync', function() {
  browserSync.init(['css/*.css', 'js/*.js', 'build/*.js', './index.html'], {
    // server: {
    //   baseDir: './',
    //   middleware: function(req, res, next){
    //     if(!(/\.(gif|png|jpg|js|css)$/ig.test(req._parsedUrl.pathname))){
    //       res.setHeader('content-type', 'text/html');
    //       res.write(fs.readFileSync('./index.html'));
    //       res.end();
    //     }else{
    //       next();
    //     }
    //   }
    // },
    proxy: "localhost:" + config.node_port,
    port: config.app_port,
    ui: {
      port: config.app_port + 1
    },
    reloadOnRestart: true,
    open: false
  });
});

gulp.task('scripts', function(){
  return gulp.src(s('js/*.js'))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
    }))
    .pipe(gulp.dest(d('js')));
});

gulp.task('lib', function(){
  return gulp.src(s('js/lib/*.js'))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
    }))
    .pipe(gulp.dest(d('lib')));
});

gulp.task('template:dev', function(){
  var wds_server = "http://localhost:3000/";
  var webpack_assets = JSON.parse(fs.readFileSync('./build/webpack.assets.js').toString());
  return gulp.src(s('index.html'))
    .pipe(template({
      'root': config.root,
      'commons': webpack_assets.commons.js,
      'index': webpack_assets.index.js,
     }))
    .pipe(rev())
    .pipe(gulp.dest('./'))
    .pipe(rename({extname: '.hbs'}))
    .pipe(gulp.dest(config.views));
});

gulp.task('template:deploy', function(){
  var webpack_assets = JSON.parse(fs.readFileSync('./build/webpack.assets.js').toString());
  return gulp.src(s('index.html'))
    .pipe(template({
      'root': config.root,
      'commons': webpack_assets.commons.js,
      'index': webpack_assets.index.js,
     }))
    .pipe(rev())
    .pipe(gulp.dest('./'))
    .pipe(rename({extname: '.hbs'}))
    .pipe(gulp.dest(config.views));
});

gulp.task('images', function () {
  return gulp.src(s('images/*'))
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [/*jpgmin({quality: 'low'}), */pngquant()]
  }))
  .pipe(gulp.dest(d('images')));
});

gulp.task("webpack:react", function(callback) {
  webpack(webpack_deploy_config, function(err, stats) {
    if(err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({}));
    callback();
  });
});

//@1: 第一步操作
gulp.task("webpack-dev-server", function(callback) {
  var port = config.webpack_port;
  webpack_dev_config.entry.index.unshift("webpack-dev-server/client?http://localhost:3000/", "webpack/hot/dev-server");
  new WebpackDevServer(webpack(webpack_dev_config), {
    hot: true,
    noInfo: true,
    stats: { colors: true },
  }).listen(port, "localhost", function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", "http://localhost:"+ port);
  });
});
gulp.task("wds", ['webpack-dev-server']);

//@2: 第二步操作
gulp.task('default', ['css', 'sass', 'scripts', 'lib', 'images', 'template:dev', 'browser-sync'], function () {
  gulp.watch(s('sass/**/*'), ['sass']);
  gulp.watch(s('js/*.js'), ['scripts']);
  gulp.watch(s('images/*'), ['images']);
  gulp.watch(s('css/*.css'), ['css']);
  gulp.watch(s('*.html'), ['template:dev']);

});

gulp.task('deploy', gulpSequence('webpack:react', 'css', 'sass', 'scripts', 'images', 'lib', 'template:deploy'));
