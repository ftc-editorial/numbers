const promisify = require('promisify-node')
const fs = promisify('fs');
const path = require('path');
const url = require('url');
const isThere = require('is-there');
const co = require('co');
const mkdirp = require('mkdirp');
const helper = require('./helper');
const merge = require('deepmerge');

const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const minimist = require('minimist');
process.env.NODE_ENV = 'dev';

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

const webpack = require('./webpack.config.js');

// const webpackConfig = require('./webpack.config.js');

const footer = require('./bower_components/ftc-footer');

const config = require('./config.json');

const demoList = ['numbers-china'];

const projects = argv.a ? demoList : [argv.i];

const index = argv.a ? 'index.html' : `${argv.i}.html`;

const prodSetting = {
  "production": true
};

const tmpDir = '.tmp';

process.env.NODE_ENV = 'development';
// change NODE_ENV between tasks.
gulp.task('prod', function() {
  return Promise.resolve(process.env.NODE_ENV = 'production');
});

gulp.task('dev', function(done) {
  return Promise.resolve(process.env.NODE_ENV = 'development');
});

function urlPrefix (data, prefix) {
  data.sections.forEach(section => {
    section.cards.forEach(card => {
      if (card.svg) {
        card.svg = `${prefix}${card.svg}`
      }
    });
  });
  return data; 
}

gulp.task('html', () => {
  return co(function *() {

    if (!isThere(tmpDir)) {
      mkdirp.sync(tmpDir);
    }

    const data = yield Promise.all(projects.map(project => {
      const file = path.resolve(process.cwd(), `data/${project}.json`);
      return helper.readJson(file);
    }));

    const renderResults = yield Promise.all(data.map(d => {
      const template = 'index.html';
      console.log(`Using data file ${d.name}.json`);

      const context = merge({
        footer: footer,
        production: process.env.NODE_ENV === 'prod'
      }, d.content);

      
      return helper.render(template, context, d.name);
    }));

    yield Promise.all(renderResults.map(result => {
      return fs.writeFile(`${tmpDir}/${result.name}.html`, result.content, 'utf8');
    }));      
  })
  .then(function(){
    browserSync.reload('*.html');
  }, function(err) {
    console.error(err.stack);
  });
});


// generate partial html files to be used on homepage widget.
gulp.task('widgets', () => {
  return co(function *() {

    if (!isThere(tmpDir)) {
      mkdirp.sync(tmpDir);
    }

    const json = yield fs.readFile(`data/${argv.i}.json`, 'utf8');
    var data = JSON.parse(json);
    
    if (process.env.NODE_ENV === 'production') {
         data = urlPrefix(data, config.urlPrefix);
    } 
   
// loop over each section. Each section corresponds to an html file. Take `section.id` as file name.
    const renderResults = yield Promise.all(data.sections.map(section => {
      const template = 'widget.html';
      console.log(`Generating file for ${section.id}`);

      return helper.render(template, {section: section}, section.id);
    }));
// use `numbers-china-` as file namespace.
    yield Promise.all(renderResults.map(result => {
      return fs.writeFile(`${tmpDir}/${argv.i}-${result.name}.html`, result.content, 'utf8');
    }));      
  })
  .then(function(){
    browserSync.reload('*.html');
  }, function(err) {
    console.error(err.stack);
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