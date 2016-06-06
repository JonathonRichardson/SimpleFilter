var gulp    = require('gulp');
var fs      = require('fs');
var _       = require('underscore');
var wrapper = require('gulp-module-wrapper');
var insert  = require('gulp-insert');
var del     = require('del');
var eol     = require('gulp-eol');
var gutil   = require('gulp-util');
var jshint  = require('gulp-jshint');
var uglify  = require('gulp-uglify');
var rename  = require('gulp-rename');
var notify  = require('gulp-notify');
var concat  = require('gulp-concat');
var replace = require('gulp-replace');

gulp.task('default', ['build']);

gulp.task('test', ['build'], function () {
    console.log("testing...");
});

gulp.task('clean', function(cb) {
    del(['dist']);
    cb();
});

gulp.task('build', ['clean'], function() {
    var json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    var version = json.version;

    var code    = gulp.src('src/Filter.js').pipe(concat('filter.js'));
    var amdcode = gulp.src('src/Filter.js').pipe(concat('filter.js'));
    var cjscode = gulp.src('src/Filter.js').pipe(concat('filter.js'));

    //JSHint
    gutil.log('Running JSHint');
    gulp.src('src/Filter.js').pipe(jshint()).pipe(jshint.reporter('default'));

    var pipes = [code, amdcode, cjscode];

    _.each(pipes, function(value) {
        //Update the version number from the source file
        value = value.pipe(replace('{{VERSION}}', version));
    });

    var EOL = '\n';

    var noamd = code
        .pipe(insert.prepend("var Filter = {};" + EOL + "(function() {" + EOL + EOL))
        .pipe(insert.append(EOL + EOL + "})();"))
        .pipe(eol())
        .pipe(rename('filter-no-amd.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('filter-no-amd.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));

    var amd = amdcode.pipe(insert.prepend("var Filter = {};" + EOL))
        .pipe(wrapper({
            name: false,
            deps: ['jquery', 'underscore'],
            args: ['$',      '_'],
            exports: 'Filter'
        }))
        .pipe(eol())
        .pipe(rename('filter-amd.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('filter-amd.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(notify({ message: 'Scripts task complete' }));

    var cjs = cjscode.pipe(insert.prepend("var Filter = {};" + EOL))
        .pipe(wrapper({
            name: false,
            deps: ['jquery', 'underscore'],
            args: ['$',      '_'],
            exports: 'Filter',
            type: 'commonjs'
        }))
        .pipe(eol())
        .pipe(rename('filter-commonjs.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('filter-commonjs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(notify({ message: 'Scripts task complete' }));

    return amd;
});