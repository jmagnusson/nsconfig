'use strict';

var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins(),
    appRoot = process.cwd(),
    paths = {
        jsSrc: appRoot + '/src/**/*.js',
        jsDist: appRoot + '/dist/**/*.js',
        jsTests: appRoot + '/test/**/*-test.js'
    };

var defaultTasks = ['env:test', 'test:babel', 'test:jshint', 'test:coverage'];

gulp.task('env:test', function () {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    process.env.NODE_ENV = 'test';
});

gulp.task('test:babel', function () {
    return gulp.src(paths.jsSrc)
        .pipe(plugins.babel())
        .pipe(gulp.dest(appRoot + '/dist'));
});

gulp.task('test:jshint', ['test:babel'], function () {
    return gulp.src(paths.jsDist)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('test:coverage', ['test:jshint'], function () {
    var deferred = require('q').defer();

    var executeTests = function () {
        gulp.src(paths.jsTests)
            .pipe(plugins.plumber())
            .pipe(plugins.mocha({
                reporters: 'spec'
            }))
            .pipe(plugins.istanbul.writeReports({
                reports: ['lcovonly']
            })); // Creating the reports after tests runned
    };

    // instrumentation *.js
    gulp.src(paths.jsDist)
        .pipe(plugins.plumber())
        .pipe(plugins.istanbul({
            includeUntested: true,
            instrumenter: require('isparta').Instrumenter

        })) // Covering files
        .pipe(plugins.istanbul.hookRequire())// Force `require` to return covered files
        .on('finish', function(){ executeTests()});
    return deferred.promise
});

gulp.task('test', defaultTasks);