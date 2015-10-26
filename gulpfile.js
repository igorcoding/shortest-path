var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var amdOptimize = require('amd-optimize');
var concat = require('gulp-concat');
var goServer = require('golang-server-reload');
var process = require('process');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var plumber = require('gulp-plumber');
var defineModule = require('gulp-define-module');

var STATIC_DIR = './static/';

function staticFile(path) {
    return STATIC_DIR + path;
}

gulp.task('clean', function() {
    return del(['build']);
});

gulp.task('sass', function () {
    return gulp.src(staticFile('sass/**/*.scss'))
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(staticFile('css')));
});

gulp.task('sass:watch', function () {
    gulp.watch(staticFile('sass/**/*.scss'), ['sass']);
});

gulp.task('scripts', function() {
    return gulp.src(staticFile('js/**/*.js'))
        .pipe(plumber())
        .pipe(amdOptimize('main', {
            configFile: 'main.js'
        }))
        .pipe(concat('main-bundle.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('templates', function(){
    return gulp.src(staticFile('templates/**/*.hbs'))
        .pipe(plumber())
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: 'Templates',
            noRedeclare: true
        }))
        .pipe(concat('Templates.js'))
        .pipe(wrap("define(['handlebars'], function(Handlebars) { <%= contents %>; return this['Templates']});"))
        .pipe(gulp.dest(staticFile('js/util/')));
});

gulp.task('templates:watch', function () {
    gulp.watch(staticFile('templates/**/*.hbs'), ['templates']);
});

gulp.task('watch', ['sass:watch', 'templates:watch']);

gulp.task('server', function() {
    var server = new goServer('github.com/igorcoding/shortest-path', '.', process.env.GOPATH + '/bin/shortest-path');
    server.serve(12345, 8080);
});

gulp.task('default', ['clean', 'sass', 'templates', 'watch', 'server']);