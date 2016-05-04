var gulp           = require('gulp');
var concat         = require('gulp-concat');
var jshint         = require('gulp-jshint');
var jshintReporter = require('jshint-stylish');
var nodemon        = require('gulp-nodemon');
var sass           = require('gulp-sass');
var shell          = require('gulp-shell');
var uglify         = require('gulp-uglify');
var wrap           = require('gulp-wrap');

var waterfall = require('async').waterfall;
var readdir   = require('fs').readdir;

function compressScripts(moduleName) {
    return gulp.src('./public/js/modules/' + moduleName + '/*.js')
        // Wrap each script in a IIFE, acts like a namespace.
        .pipe(wrap('(function() {<%= contents %>})();'))
        .pipe(concat(moduleName + '.min.js'))
        // Wrap the concatenated files into one controlled module that
        // exectutes when the document is ready.
        .pipe(wrap('$(function() {\'use strict\';\n<%= contents %>});'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/js/'));
}

var paths = {
    'src': [
        './public/js/modules/**/*.js',
        './models/**/*.js', './routes/**/*.js',
        'keystone.js', 'package.json'
    ],
    'style': {
        all: './public/styles/**/*.scss',
        output: './public/styles/'
    }
};

// gulp lint
gulp.task('lint', function() {
    gulp.src(paths.src)
        .pipe(jshint())
        .pipe(jshint.reporter(jshintReporter));
});

// gulp watcher for lint
gulp.task('watch:lint', function() {
    gulp.watch(paths.src, ['lint']);
});


gulp.task('watch:sass', function() {
    gulp.watch(paths.style.all, ['sass']);
});

gulp.task('sass', function() {
    gulp.src(paths.style.all)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(paths.style.output));
});

gulp.task('scripts', function() {
    return waterfall([
        function(callback) {
            readdir('./public/js/modules', callback);
        },
        function(modules, callback) {
            var tasks = modules.map(compressScripts);

            callback(null, tasks);
        }
    ], function(err, tasks) {
        return tasks;
    });
});

gulp.task('watch:scripts', function() {
    gulp.watch('./public/js/modules/**/*.js', ['scripts']);
});

gulp.task('runKeystone', shell.task('node keystone.js'));

gulp.task('watch', [
    'watch:sass',
    'watch:lint',
    'watch:scripts'
]);

gulp.task('start', function() {
    nodemon({
        script: 'keystone.js',
        ext: 'js',
        env: {
            'NODE_ENV': 'development'
        }
    });
});

gulp.task('build', ['sass', 'scripts']);
gulp.task('default', ['build', 'watch', 'start']);
