const pify = require('pify');
const fs = require('fs-jetpack');
const path = require('path');
const loadJsonFile = require('load-json-file');
const inline = pify(require('inline-source'));
const rollup = require('rollup').rollup;
const bowerResolve = require('rollup-plugin-bower-resolve');
const buble = require('rollup-plugin-buble');
let cache;
const browserSync = require('browser-sync').create();
const cssnext = require('postcss-cssnext');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const render = require('./util/render.js');
const footer = require('./bower_components/ftc-footer');
const config = require('./config.json');
const deployDir = path.resolve(__dirname, '../ft-interact/static');
const tmpDir = path.resolve(__dirname, '.tmp');
let cache;
const project = 'numbers-china';

process.env.NODE_ENV = 'development';
// change NODE_ENV between tasks.
gulp.task('prod', function() {
  return Promise.resolve(process.env.NODE_ENV = 'production');
});

gulp.task('dev', function(done) {
  return Promise.resolve(process.env.NODE_ENV = 'development');
});

function buildPage(template, data) {
  return render(template, data)
    .then(html => {
      if (process.env.NODE_ENV === 'production') {
        return inline(html, {
          compress: true,
          rootpath: path.resolve(process.cwd(), '.tmp')
        });
      }    
      return html;      
    })
    .catch(err => {
      throw err;
    });
}

gulp.task('html', () => {
  const env = {
    isProduction: process.env.NODE_ENV === 'production'
  };  
  return loadJsonFile(`data/${project}.json`)
    .then(json => {
      const context = Object.assign(json, {
        footer: footer,
        env
      });
      return buildPage('numbers.html', context);
    })
    .then(html => {
      return fs.writeAsync(`${tmpDir}/${project}.html`, html);
    })
    .then(() => {
      browserSync.reload('*.html');
      return Promise.resolve();
    })
    .catch(err => {
      console.log(err);
    });  
});

// generate partial html files to be used on homepage widget.
function buildWidgets(sections) {
  const promisedWidgets = sections.map(section => {
    const dest = `${tmpDir}/${project}-${section.id}.html`;
    return buildPage('widget.html', {section: section})
      .then(html => {
        return fs.writeAsync(dest, html);
      })
      .catch(err => {
        throw err;
      })
  });
  return Promise.all(promisedWidgets);
}

gulp.task('widgets', () => {
  return loadJsonFile(`data/${project}.json`)
    .then(json => {
      return buildWidgets(json.sections);
    })
    .catch(err => {
      console.log(err);
    });
});

gulp.task('styles', function styles() {
  const dest = `${tmpDir}/styles`;

  return gulp.src('client/*.scss')
    .pipe($.changed(dest))
    .pipe($.plumber())
    .pipe($.sourcemaps.init({loadMaps:true}))
    .pipe($.sass({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['bower_components']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      cssnext({
        features: {
          colorRgba: false
        }
      })
    ]))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
});

gulp.task('eslint', () => {
  return gulp.src('client/js/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('scripts', () => {
  return rollup({
    entry: 'client/main.js',
    plugins: [
      bowerResolve({
// Use `module` field for ES6 module if possible        
        module: true
      }),
// buble's option is no documented. Refer here.
      buble({
        include: ['client/**'],
// FTC components should be released together with a transpiled version. Do not transpile again here.  
        exclude: [
          'bower_components/**',
          'node_modules/**'
        ],
        transforms: {
          dangerousForOf: true
        }
      })
    ],
    cache: cache
  }).then(function(bundle) {
    // Cache for later use
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

// This task is used for backedn only.
gulp.task('watch', gulp.parallel('styles', 'scripts', () => {
  gulp.watch('client/**/*.js', gulp.parallel('scripts'));
  gulp.watch('client/**/*.scss', gulp.parallel('styles'));
}));

gulp.task('serve', 
  gulp.parallel(
    'html', 'styles', 'scripts', 

    function serve() {
    browserSync.init({
      server: {
        baseDir: [tmpDir, 'client'],
        index: `${project}.html`,
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch('client/**/*.{csv,svg,png,jpg}', browserSync.reload);
    gulp.watch('client/**/*.js', gulp.parallel('scripts'));
    gulp.watch('client/**/*.scss', gulp.parallel('styles'));
    gulp.watch(['views/**/*.html', 'data/*.json'], gulp.parallel('html', 'widgets'));
  })
);

// For server only build frontend assets
gulp.task('build', gulp.series('prod', gulp.parallel('styles', 'scripts'), 'dev'));

gulp.task('deploy:widgets', () => {
  const DEST = path.resolve(__dirname, config.widgets);

  return gulp.src(`.tmp/${project}-*.html`)
    .pipe($.htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true
    }))
    .pipe(gulp.dest(DEST));  
});

gulp.task('images', function () {
  const DEST = path.resolve(__dirname, config.assets);
  console.log(`Copying images to ${DEST}`)
  return gulp.src('client/**/*.{svg,png,jpg,jpeg,gif}')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest(DEST));
});

gulp.task('deploy', gulp.parallel('deploy:widgets', 'images'));

// Currently we give up webpack as it is hard to configure.
/*
 * To use webpack you should install those modules:
 * `babel-core`, `babel-loader`, `babel-preset-latest`.
 * `babel-loader` needs to be above 7.0 which is not released yet.
 */
// gulp.task('webpack', function() {
//   if (process.env.NODE_ENV === 'production') {
//     delete webpackConfig.watch;
//   }
//   return webpack(webpackConfig)
//     .then(stats => {
//       console.log(stats.toString({
//         colors: true
//       }));
//     })
//     .catch(err => {
//       console.log(err);
//     });
// });