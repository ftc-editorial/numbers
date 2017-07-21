const path = require('path');
const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');

const rollup = require('rollup').rollup;
const bowerResolve = require('rollup-plugin-bower-resolve');
const babel = require('rollup-plugin-babel');

const buildPage = require('./utils/build-page.js');

const tmpDir = path.resolve(__dirname, '.tmp');

gulp.task('prod', function() {
  return Promise.resolve(process.env.NODE_ENV = 'production');
});

gulp.task('dev', function() {
  return Promise.resolve(process.env.NODE_ENV = 'development');
});

gulp.task('html', () => {
  return buildPage()
    .then(() => {
      browserSync.reload('*.html');
      return Promise.resolve();
    })
    .catch(err => {
      console.log(err);
    });  
});

gulp.task('styles', function styles() {
  const dest = `${tmpDir}/styles`;
  return gulp.src('client/*.scss')
    .pipe(sourcemaps.init({loadMaps:true}))
    .pipe(sass({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['bower_components']
    }))
    .on('error', (err) => {
      console.log(err);
    })
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
});

let cache;
gulp.task('scripts', () => {
  return rollup({
    entry: 'client/main.js',
    plugins: [
      bowerResolve(),
      babel({
        exclude: 'node_modules/**'
      })
    ],
    cache: cache
  }).then(function(bundle) {
    cache = bundle;

    return bundle.write({
      dest: `${tmpDir}/scripts/main.js`,
      format: 'iife',
      sourceMap: true
    });
  })
  .then(() => {
    browserSync.reload();
    return Promise.resolve();
  })
  .catch(err => {
    console.log(err);
  });
});

gulp.task('bs', () => {
  browserSync.init({
    server: {
      baseDir: [tmpDir, 'client'],
      index: `numbers-china.html`,
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('client/**/*.{csv,svg,png,jpg}', browserSync.reload);
  gulp.watch('client/**/*.js', gulp.parallel('scripts'));
  gulp.watch('client/**/*.scss', gulp.parallel('styles'));
  gulp.watch(['views/**/*.html', 'public/*.json'], gulp.parallel('html'));
});

gulp.task('serve', gulp.series(gulp.parallel('html', 'styles', 'scripts'), 'bs'));

gulp.task('images', function () {
  const dest = `${deployDir}/images`
  console.log(`Copy images to ${dest}`)
  return gulp.src('client/images/*.{svg,png,jpg,jpeg,gif}')
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('watch', gulp.parallel('styles', 'scripts', () => {
  gulp.watch('client/**/*.js', gulp.parallel('scripts'));
  gulp.watch('client/**/*.scss', gulp.parallel('styles'));
}));