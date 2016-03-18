'use strict';

const gulp                = require('gulp');
const path                = require('path');
const webpack             = require('webpack');
const replace             = require('gulp-replace');
const imagemin            = require("gulp-imagemin");
const pngquant            = require('imagemin-pngquant');
const minifyCss           = require('gulp-minify-css');
const plumber             = require('gulp-plumber');
const uglify              = require('gulp-uglify');
const rename              = require("gulp-rename");
const WebpackDevServer    = require("webpack-dev-server");

const webpackDevConfig    = require('./webpack.dev.config.js');
const webpackDeployConfig = require('./webpack.deploy.config.js');

const config = {
    appPort: 8080,
    webpackPort: 3000,
    nodePort: 3001,
    root: '/', //资源路径
    src: 'src/',
    dest: './',
    views: '../views/'
};

const getSourcePath = filePath => path.join(config.src, filePath);
const getDestPath   = filePath => path.join(config.dest, filePath);

gulp.task('images', () => gulp.src(getSourcePath('images/*'))
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{
            removeViewBox: false
        }],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(getDestPath('images')))
);

// 这玩意儿没法用webpack打包……
gulp.task('lib', () => gulp.src(getSourcePath('js/lib/*.js'))
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest(getDestPath('lib')))
);

gulp.task('html', () => gulp.src(getSourcePath('index.html'))
    .pipe(rename({
        extname: '.hbs'
    }))
    .pipe(gulp.dest(config.views))
);

gulp.task('default', ['images', 'lib', 'html']);