var gulp                  = require('gulp');
var path                  = require('path');
var fs                    = require('fs');
var sass                  = require('gulp-sass');
var browserSync           = require('browser-sync');
var prefix                = require('gulp-autoprefixer');
var concat                = require('gulp-concat');
var minifyCss             = require('gulp-minify-css');
var plumber               = require('gulp-plumber');
var uglify                = require('gulp-uglify');
var rename                = require("gulp-rename");
var imagemin              = require("gulp-imagemin");
var pngquant              = require('imagemin-pngquant');
var rev                   = require('gulp-rev-append');
var gulpSequence          = require('gulp-sequence')
// var cheerio            = require('gulp-cheerio');
var replace               = require('gulp-replace');
// var gzip               = require('gulp-gzip');

var gutil                 = require("gulp-util");
var webpack               = require("webpack");
var WebpackDevServer      = require("webpack-dev-server");
var webpack_dev_config    = require('./src/js/redux/webpack.dev.config.js');
var webpack_deploy_config = require('./src/js/redux/webpack.deploy.config.js');

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
  gulp.src([s('css/normalize.css'), s('css/bs.css'), s('css/datepicker.css')])
  .pipe(concat('common.css'))
  .pipe(minifyCss())
  .pipe(gulp.dest(d('css')));
});

gulp.task('sass', function() {
  gulp.src(s('sass/style.sass'))
  .pipe(plumber())
  //compressed
  .pipe(sass({outputStyle: ''}))
  .pipe(prefix('last 2 versions', '> 1%', 'ie 8', 'Android 2', 'Firefox ESR'))
  .pipe(plumber())
  .pipe(gulp.dest(d('css')));
});

gulp.task('browser-sync', function() {
  browserSync.init(['css/*.css', 'js/*.js', 'index.html'], {
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

gulp.task('template:pre', function(){
  var wds_server = "http://localhost:3000/"
  return gulp.src(s('index.html'))
    .pipe(replace(/\{\{root\}\}/g, config.root))
    .pipe(replace(/\{\{app\.js\}\}/, wds_server + 'app.js'))
    .pipe(replace(/\{\{webpack-dev-server\.js\}\}/, '<script src="' + wds_server + 'webpack-dev-server.js"></script>'))
    .pipe(gulp.dest('./'))
    .pipe(rename({
      extname: '.hbs'
    }))
    .pipe(gulp.dest(config.views));
});

gulp.task('template:deploy', function(){
  return gulp.src(s('index.html'))
    .pipe(replace(/\{\{root\}\}/g, config.root))
    .pipe(replace(/\{\{app\.js\}\}/, '/js/app.min.js?rev=@@hash'))
    .pipe(replace(/\{\{webpack-dev-server\.js\}\}/, ''))
    .pipe(gulp.dest('./'))
    .pipe(rename({
      extname: '.hbs'
    }))
    .pipe(gulp.dest(config.views));
});
gulp.task('template:local', function(){
  var local_root = '';
  return gulp.src(s('index.html'))
    .pipe(replace(/\{\{root\}\}/g, local_root))
    .pipe(replace(/\{\{app\.js\}\}/, local_root + 'js/app.min.js?rev=@@hash'))
    .pipe(replace(/\{\{webpack-dev-server\.js\}\}/, ''))
    .pipe(gulp.dest('./'));
});

gulp.task('images', function () {
  return gulp.src(s('images/*'))
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(gulp.dest(d('images')));
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

gulp.task("rev", function(){
  return gulp.src('./index.html')
    .pipe(rev())
    .pipe(gulp.dest('.'));
});

//@1: 第一步操作
gulp.task("webpack-dev-server", function(callback) {
  var port = config.webpack_port;
  webpack_dev_config.entry.unshift(
    "webpack-dev-server/client?http://localhost:" + port,
    'webpack/hot/only-dev-server');
  new WebpackDevServer(webpack(webpack_dev_config), {
    hot: true,
    // inline: true,
    // noInfo: true,
    stats: { colors: true },
    colors: true,
    contentBase: 'xxxxxx'
  }).listen(config.webpack_port, "localhost", function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", "http://localhost:"+ port);
  });
});

//@2: 第二步操作
gulp.task('default', ['css', 'sass', 'scripts', 'images', 'template:pre', 'browser-sync'], function () {
  gulp.watch(s('sass/**/*'), ['sass']);
  gulp.watch(s('js/*.js'), ['scripts']);
  gulp.watch(s('images/*'), ['images']);
  gulp.watch(s('css/*.css'), ['css']);
  gulp.watch(s('*.html'), ['template:pre']);

});

gulp.task('deploy', gulpSequence('webpack:react', 'scripts', 'template:deploy', 'rev'));

//本地直接打开index.html测试用
gulp.task('deploy:local', gulpSequence('webpack:react', 'scripts', 'template:local', 'rev'));