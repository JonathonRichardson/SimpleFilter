var gulp    = require('gulp');
var fs      = require('fs');
var _       = require('underscore');
var wrapper = require('gulp-module-wrapper');
var insert  = require('gulp-insert');
var del     = require('del');
var eol     = require('gulp-eol');
var gutil   = require('gulp-util');
const debug = require('gulp-debug');
var jshint  = require('gulp-jshint');
var uglify  = require('gulp-uglify');
var rename  = require('gulp-rename');
var notify  = require('gulp-notify');
var concat  = require('gulp-concat');
var replace = require('gulp-replace');
var jasmine = require('gulp-jasmine');
var clone   = require('gulp-clone');
var ts = require('gulp-typescript');
var JasmineConsoleReporter = require('jasmine-console-reporter');
var merge   = require('merge2');
var gulpWebpack = require('gulp-webpack');
var webpack = require('webpack');

gulp.task('default', ['build']);

gulp.task('test', ['build'], function () {
    return gulp.src("test/tests.js").pipe(jasmine({
        "stopSpecOnExpectationFailure": false,
        "random": false,
        reporter: new JasmineConsoleReporter()
    }));
});

gulp.task('clean', function(cb) {
    del(['dist']).then(function() {
        cb();
    });
});

gulp.task('build', ['clean'], function() {
    return gulp.src('src/filter.ts')
        .pipe(gulpWebpack(require('./webpack.config.js'), webpack))
        .pipe(gulp.dest('dist/'));
});