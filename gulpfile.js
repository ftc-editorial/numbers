const pify = require('pify');
const fs = require('fs-jetpack');
const path = require('path');
const url = require('url');
const deepAssign = require('deep-assign');
const webpack = pify(require('webpack'));
const loadJsonFile = require('load-json-file');
const webpackConfig = require('./webpack.config.js');
const render = require('./util/render.js');

const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const minimist = require('minimist');
const knownOptions = {
  string: ['input'],
  boolean: 'all',
  alias: {
    i: 'input',
    a: 'all'
  },
  default: {
    input: 'numbers-china'
  }, 
};
const argv = minimist(process.argv.slice(2), knownOptions);

const footer = require('./bower_components/ftc-footer');

const config = require('./config.json');

const demoList = ['numbers-china'];

const projects = argv.a ? demoList : [argv.i];

const index = argv.a ? 'index.html' : `${argv.i}.html`;

const tmpDir = '.tmp';

process.env.NODE_ENV = 'development';
// change NODE_ENV between tasks.
gulp.task('prod', function() {
  return Promise.resolve(process.env.NODE_ENV = 'production');
});

gulp.task('dev', function(done) {
  return Promise.resolve(process.env.NODE_ENV = 'development');
});

gulp.task('html', () => {
  const template = 'index.html';
  return Promise.all(projects.map(project => {
    const dest = `${tmpDir}/${project}.html`;
    const dataFile = path.resolve(process.cwd(), `data/${project}.json`);
    console.log(`Reading data: ${dataFile}`)
    return loadJsonFile(dataFile)
      .then(json => {
        return deepAssign(json, {
          footer: footer,
          production: process.env.NODE_ENV === 'production'
        })
      })
      .then(context => {
        return render(template, context);
      })
      .then(html => {
        console.log(`Build page: ${dest}`);
        return fs.writeAsync(dest, html);
      }).
      catch(err => {
        throw(err);
      });
  }))
  .then(() => {
    browserSync.reload('*.html');
    return Promise.resolve();
  })
  .catch(err => {
    console.log(err);
  });  
});

// generate partial html files to be used on homepage widget.
gulp.task('widgets', () => {
  const template = 'widget.html';

  return loadJsonFile(`data/${argv.i}.json`)
    .then(json => {
      console.log(json);
      return Promise.all(json.sections.map(section => {
        console.log(`Generating file for ${section.id}`);
        const dest = `${tmpDir}/${argv.i}-${section.id}.html`
        return render(template, {section: section})
          .then(html => {
            console.log(`Build page: ${dest}`);
            return fs.writeAsync(dest, html);
          });
      }));
    })
    .catch(err => {
      console.log(err);
    });
});

gulp.task('styles', function styles() {
  const DEST = '.tmp/styles';

  return gulp.src(['client/scss/main.scss', 'client/scss/widget.scss'])
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

  return gulp.src(`.tmp/${argv.i}.html`)
    .pipe($.smoosher({
      ignoreFilesNotFound: true
    }))
    .pipe($.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest(DEST));
});

gulp.task('deploy:widgets', () => {
  const DEST = path.resolve(__dirname, config.widgets);

  return gulp.src(`.tmp/${argv.i}-*.html`)
    .pipe($.smoosher({
      ignoreFilesNotFound: true
    }))
    .pipe($.htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyCSS: true
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