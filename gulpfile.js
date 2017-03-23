const pify = require('pify');
const fs = require('fs-jetpack');
const path = require('path');
const loadJsonFile = require('load-json-file');
const inline = pify(require('inline-source'));
const webpack = pify(require('webpack'));

const webpackConfig = require('./webpack.config.js');
const render = require('./util/render.js');

const browserSync = require('browser-sync').create();

const cssnext = require('postcss-cssnext');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const footer = require('./bower_components/ftc-footer');
const config = require('./config.json');
const tmpDir = '.tmp';
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
      return buildPage('index.html', context);
    })
    .then(html => {
      return fs.writeAsync(`.tmp/${project}.html`, html);
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
  const DEST = '.tmp/styles';

  return gulp.src('client/scss/*.scss')
    .pipe($.changed(DEST))
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
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream());
});

gulp.task('eslint', () => {
  return gulp.src('client/js/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('webpack', function() {
  if (process.env.NODE_ENV === 'production') {
    delete webpackConfig.watch;
  }
  return webpack()
    .then(stats => {
      console.log(stats.toString({
        colors: true
      }));
    })
    .catch(err => {
      console.log(err);
    });
});

gulp.task('serve', 
  gulp.parallel(
    'html', 'widgets', 'styles', 'webpack', 

    function serve() {
    browserSync.init({
      server: {
        baseDir: [tmpDir, 'client'],
        index: index,
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch('client/**/*.{csv,svg,png,jpg}', browserSync.reload);
    gulp.watch('client/scss/**/*.scss', gulp.parallel('styles'));
    gulp.watch(['views/**/*.html', 'data/*.json'], gulp.parallel('html', 'widgets'));
  })
);


gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('html', 'widgets', 'styles', 'webpack'), 'dev'));


gulp.task('deploy:html', function() {
  const DEST = path.resolve(__dirname, config.html);

  console.log(`Deploying HTML file to: ${DEST}`);

  return gulp.src(`.tmp/${project}.html`)
    .pipe($.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
    }))
    .pipe(gulp.dest(DEST));
});

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

gulp.task('deploy', gulp.series('build', gulp.parallel('deploy:html','deploy:widgets', 'images')));