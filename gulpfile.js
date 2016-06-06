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
var jasmine = require('gulp-jasmine');
var clone   = require('gulp-clone');
var JasmineConsoleReporter = require('jasmine-console-reporter');
var merge   = require('merge2');

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

var wrap = function(stream, type, dependencies, exportName) {
    var wrapperConfig = {
        name: false,
        deps: _.keys(dependencies),
        args: _.values(dependencies),
        exports: exportName
    };
    
    return stream.pipe(clone())
        .pipe(wrapper(_.extend(wrapperConfig, {type: type})))
        .pipe(eol())
        .pipe(rename(function(path) { path.basename += '-' + type; }));
};

var finalize = function(stream, dependencies, exportName) {
    dependencies = dependencies || {};
    var EOL = '\n';

    var globalcode = stream.pipe(clone());
    var amdcode    = stream.pipe(clone());
    var cjscode    = stream.pipe(clone());

    // Wrap the global code
    globalcode = globalcode
        .pipe(insert.prepend("(function() {" + EOL + EOL))
        .pipe(insert.append(EOL + EOL + "})();"));
    
    _.each([globalcode, amdcode, cjscode], function(stream) {
        stream = stream.pipe(insert.prepend("var " + exportName + " = {};" + EOL));
    });
    
    globalcode = globalcode
        .pipe(eol())
        .pipe(rename(function(path) { path.basename += '-globalvar'; }));
    
    amdcode = wrap(amdcode, 'amd',      dependencies, exportName);
    cjscode = wrap(cjscode, 'commonjs', dependencies, exportName);
    
    var collectedStreams = merge();
    _.each([globalcode, cjscode, amdcode], function(stream) {
        collectedStreams.add(stream.pipe(clone()));
    });

    return collectedStreams;
};

gulp.task('build', ['clean'], function() {
    var json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    var version = json.version;

    var code    = gulp.src('src/Filter.js').pipe(concat('filter.js'));

    //JSHint
    gutil.log('Running JSHint');
    code = code.pipe(jshint()).pipe(jshint.reporter('default'));

    var finalFiles = finalize(code, {
        'moment':     'moment',
        'underscore': '_'
    }, 'Filter');

    var minifiedFiles = finalFiles.pipe(clone())
        .pipe(rename(function(path) { path.basename += '-min'; }))
        .pipe(uglify());

    var allFiles = merge(finalFiles, minifiedFiles);

    return allFiles.pipe(gulp.dest('dist'));
});