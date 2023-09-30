const { series, parallel, watch, src, dest } = require('gulp');
const pump = require('pump');
const gulp = require('gulp');
const rollup = require('gulp-rollup');
const del = require('del'); // Import the del package
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const packageFile = require('./package.json');

// Define reusable paths
const path = {
    scss: 'assets/scss',
    src_js: 'assets/js/src',
    js: 'assets/js',
    css: 'assets/css',
    vendor: 'assets/vendor',
};

function serve(done) {
    browserSync.init({
        server: {
            baseDir: './',
        },
        open: true,
    });
    done();
}

function handleError(done) {
    return function (err) {
        if (err) {
            console.error(err); // Log the error
        }
        done();
    };
}

function hbs(done) {
    return src(['*.hbs', 'partials/**/*.hbs'])
        .pipe(reload({ stream: true }));
}

function css(done) {
    return src('assets/css/theme.css', { sourcemaps: true })
        .pipe(sourcemaps.init())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('assets/built/', { sourcemaps: '.' }))
        .pipe(reload({ stream: true }));
}

function js(done) {
    return src([
        'node_modules/@tryghost/shared-theme-assets/assets/js/v1/lib/**/*.js',
        'node_modules/@tryghost/shared-theme-assets/assets/js/v1/main.js',
        'assets/js/lib/*.js',
    ], { sourcemaps: true })
        .pipe(rollup({
            allowRealFiles: true,
            input: `./${path.src_js}/theme.js`,
            output: {
                format: 'iife',
                banner: `
                    /**
                     * Silicon | Multipurpose Bootstrap 5 Template & UI Kit
                     * Copyright 2023 Createx Studio
                     * Theme core scripts
                     *
                     * @author Createx Studio
                     * @version 1.5.0
                     */
                `,
            },
        }))
        .pipe(rename('theme.min.js'))
        .pipe(babel({
            presets: [['@babel/env', { modules: false }]],
        }))
        .pipe(uglify({ output: { comments: /^!|@author|@version/i } }))
        .pipe(dest(path.js))
        .pipe(reload({ stream: true }));
}

function zipper(done) {
    const filename = `${packageFile.name}.zip`;
    return src([
        '**',
        '!node_modules', '!node_modules/**',
        '!dist', '!dist/**',
        '!yarn-error.log',
    ])
        .pipe(dest('dist/'));
}

function clean() {
    return del([
    ]);
}

function vendor() {
    let dependencies = Object.keys(packageFile.dependencies);
    let libs = dependencies.map((key) => {
        return key + '/**/*';
    });
    return gulp.src(libs, { cwd: 'node_modules', base: './node_modules' })
        .pipe(gulp.dest(path.vendor));
}

const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const cssWatcher = () => watch('assets/css/**/*.css', css);
const jsWatcher = () => watch('assets/js/**/*.js', js);

exports.build = series(js, css);
exports.zip = series(exports.build, zipper);
exports.default = series(clean, vendor, parallel(jsWatcher, cssWatcher), serve);