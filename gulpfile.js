const { src, dest, parallel, series, watch, lastRun } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const includeFile = require('gulp-file-include');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const del = require('del');
const imagemin = require('gulp-imagemin');
const gulpif = require('gulp-if');
const useref = require('gulp-useref');

const port = 8000

function styles(){
    return src('app/styles/*.scss')
    .pipe(plumber())
    .pipe(sass.sync({
        outputStyle: 'expanded',
        precision: 5,
    }).on('error', sass.logError))
    .pipe(postcss([
        autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
        })
        ]))
    .pipe(dest('dist/styles/'))
    .pipe(browserSync.stream())
}

function scripts(){
    return src('app/scripts/*.js')
    .pipe(plumber())
    .pipe(dest('dist/scripts/'))
    .pipe(browserSync.stream())
}

function html(){
    return src('app/*.html')
    .pipe(useref({searchPath: 'app'}))
    .pipe(gulpif('*.html', includeFile({prefix: '@@', basepath: 'app/includes/'})))
    .pipe(dest('dist'))
}

function imagesBuild(){
    return src('app/images/**/*', { since: lastRun(imagesBuild) })
    .pipe(imagemin())
    .pipe(dest('dist/images/'))
}

function imagesCopy(){
    return src('app/images/**/*')
    .pipe(dest('dist/images/'))
}

function imagesDel(){
    return del('dist/images/')
}

function fonts(){
    return src('app/fonts/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe(dest('dist/fonts/'))
}

function clean(){
    return del('dist')
}

function startServer(){
    browserSync.init({
        notify: false,
        port,
        server: {
            baseDir: 'dist',
            routes: {
                '/node_modules': 'node_modules'
              }
        }
    })

    watch([ 'app/*.html', 
            'app/includes/*.html'], html )
            .on('change', browserSync.reload);
    watch('app/images/**/*', series(imagesDel, imagesCopy));
    watch('app/styles/**/*.scss', styles);
    watch('app/scripts/**/*.js', scripts);
    watch('app/fonts/**/*', fonts);
}

const serve = series(
    clean,
    imagesCopy, 
    fonts,
    parallel(styles, scripts, html, startServer)
)

const build = series(
    clean,
    parallel(styles, scripts), 
    html,
    imagesBuild,
    fonts
  )

exports.serve = serve
exports.build = build
exports.clean = clean