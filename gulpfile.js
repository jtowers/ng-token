var gulp = require('gulp'),
    karma = require('karma').server,
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    annotate = require('gulp-ng-annotate'),
sourceFiles = [
    'src/ngToken/ngToken.prefix',
    'src/ngToken/directives/**/*.js',
    'src/ngToken/filters/**/*.js',
    'src/ngToken/services/**/*.js',
    'src/ngToken/ngToken.js',
    'src/ngToken/ngToken.suffix'
];

gulp.task('build', function () {
    gulp.src(sourceFiles)
        .pipe(concat('ng-token.js'))
        .pipe(annotate())
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename('ng-token.min.js'))
        .pipe(gulp.dest('./dist'));
});

/**
 * Run test once and exit
 */
gulp.task('test-src', function (done) {
    karma.start({
        configFile: __dirname + '/karma-src.conf.js',
        singleRun: true
    }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-concatenated', function (done) {
    karma.start({
        configFile: __dirname + '/karma-dist-concatenated.conf.js',
        singleRun: true
    }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-minified', function (done) {
    karma.start({
        configFile: __dirname + '/karma-dist-minified.conf.js',
        singleRun: true
    }, done);
});

gulp.task('default', ['test-src', 'build']);