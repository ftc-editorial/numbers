const pify = require('pify');
const fs = require('fs-jetpack');
const path = require('path');
const loadJsonFile = require('load-json-file');
const inline = pify(require('inline-source'));
const nunjucks = require('nunjucks');
nunjucks.configure(['view', 'node_modules/@ftchinese/ftc-footer'], {
  noCache: true,
  watch: false
});
const render = pify(nunjucks.render);
const browserSync = require('browser-sync').create();
const cssnext = require('postcss-cssnext');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const rollup = require('rollup').rollup;
const bowerResolve = require('rollup-plugin-bower-resolve');
const buble = require('rollup-plugin-buble');
const uglify = require('rollup-plugin-uglify');
let cache;

const footer = require('@ftchinese/ftc-footer')({theme: 'light'});
const projectName = path.basename(process.cwd());
const deployDir = path.resolve(__dirname, `../ft-interact/static/${projectName}`);
const tmpDir = path.resolve(__dirname, '.tmp');

process.env.NODE_ENV = 'development';
// change NODE_ENV between tasks.
gulp.task('prod', function() {
  return Promise.resolve(process.env.NODE_ENV = 'production');
});

gulp.task('dev', function() {
  return Promise.resolve(process.env.NODE_ENV = 'development');
});

function buildPage(template, data) {
  const env = {
    isProduction: process.env.NODE_ENV === 'production'
  };
  const context = Object.assign(data, {env});
  const dest = `${tmpDir}/${project}.html`;
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
    .then(html => {
      return fs.writeAsync(dest, html);
    })
    .catch(err => {
      throw err;
    });
}

gulp.task('html', () => {
    
  return loadJsonFile(`test/numbers-china.legacy.json`)
    .then(json => {
      return buildPage('dashboard.html', Object.assign(json, {
        footer: footer
      }));
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
// function buildWidgets(sections) {
//   const promisedWidgets = sections.map(section => {
//     const dest = `${tmpDir}/${project}-${section.id}.html`;
//     return buildPage('widget.html', {section: section})
//       .then(html => {
//         return fs.writeAsync(dest, html);
//       })
//       .catch(err => {
//         throw err;
//       })
//   });
//   return Promise.all(promisedWidgets);
// }

// gulp.task('widgets', () => {
//   return loadJsonFile(`data/${project}.json`)
//     .then(json => {
//       return buildWidgets(json.sections);
//     })
//     .catch(err => {
//       console.log(err);
//     });
// });

gulp.task('styles', function styles() {
  const dest = `${tmpDir}/styles`;

  return gulp.src('client/*.scss')
    .pipe($.changed(dest))
    .pipe($.plumber())
    .pipe($.sourcemaps.init({loadMaps:true}))
    .pipe($.sass({
      outputStyle: process.env.NODE_ENV ? 'compressed' : 'expanded',
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

gulp.task('serve', 
  gulp.parallel(
    'html', 'styles', 'scripts', 

    function serve() {
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
    gulp.watch(['views/**/*.html', 'test/*.json'], gulp.parallel('html', 'widgets'));
  })
);

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
  const dest = `${deployDir}/images`
  console.log(`Copy images to ${dest}`)
  return gulp.src('client/images/*.{svg,png,jpg,jpeg,gif}')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest(dest));
});

// Put css, js  on static server.
gulp.task('build', gulp.parallel('styles', 'scripts'));

gulp.task('watch', gulp.parallel('build', () => {
  gulp.watch('client/**/*.js', gulp.parallel('scripts'));
  gulp.watch('client/**/*.scss', gulp.parallel('styles'));
}));

gulp.task('copy:frontend', () => {
  console.log(`Copy frontend assets to ${deployDir}`)
  return gulp.src('.tmp/**/*.{css,js,map}')
    .pipe(gulp.dest(deployDir))
})

gulp.task('deploy', gulp.series('prod', 'build', gulp.parallel('copy:frontend', 'images'), 'dev'));

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