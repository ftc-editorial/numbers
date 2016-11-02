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
process.env.NODE_ENV = 'development';

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

const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const footer = require('./bower_components/ftc-footer');

const config = require('./config.json');

const demoList = ['numbers-china'];

const projects = argv.a ? demoList : [argv.i];

const index = argv.a ? 'index.html' : `${argv.i}.html`;

const articleDataFile = path.resolve(__dirname, 'data', argv.i);
const footerDataFile = path.resolve(__dirname, 'data/footer.json');

const prodSetting = {
  "production": true
};

const tmpDir = '.tmp';

process.env.NODE_ENV = 'dev';
// change NODE_ENV between tasks.
gulp.task('prod', function(done) {
  process.env.NODE_ENV = 'prod';
  done();
});

gulp.task('dev', function(done) {
  process.env.NODE_ENV = 'dev';
  done();
});

gulp.task('html', () => {
  return co(function *() {

    if (!isThere(tmpDir)) {
      mkdirp.sync(tmpDir);
    }

    const data = yield Promise.all(projects.map(project => {
      const file = path.resolve(process.cwd(), `data/${project}.json`);
      return helper.readJson(file);
    }));

    const renderResults = yield Promise.all(data.map(datum => {
      const template = 'index.html';
      console.log(`Using data file ${datum.name}.json`);

      const context = merge({
        footer: footer
      }, datum.content);
      
      if (process.env.NODE_ENV === 'prod') {
        Object.assign(context, prodSetting);
      } 

      return helper.render(template, context, datum.name);
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


gulp.task('styles', function styles() {
  const DEST = '.tmp/styles';

  return gulp.src('client/scss/main.scss')
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

gulp.task('webpack', function(done) {
  if (process.env.NODE_ENV === 'prod') {
    delete webpackConfig.watch;
  }
  webpack(webpackConfig, function(err, stats) {
    if (err) throw new $.util.PluginError('webpack', err);
    $.util.log('[webpack]', stats.toString({
      colors: $.util.colors.supportsColor,
      chunks: false,
      hash: false,
      version: false
    }))
    browserSync.reload('main.js');
    done();
  });
});

gulp.task('serve', 
  gulp.parallel(
    'html', 'styles', 'webpack', 

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
    gulp.watch(['views/**/*.html', 'data/*.json'], gulp.parallel('html'));
  })
);


gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('html', 'styles', 'webpack'), 'dev'));

function addPrefix ($, file) {
  $('object').each(function() {
    var objectEl = $(this);
    var href = objectEl.attr('data')
    if (href) {
      objectEl.attr('data', url.resolve(config.urlPrefix, href));
    }    
  });
}

gulp.task('prefix', function() {
  const DEST = path.resolve(__dirname, config.html);

  console.log(`Deploying HTML file to: ${DEST}`);

  return gulp.src('.tmp/*.html')
    .pipe($.smoosher({
      ignoreFilesNotFound: true
    }))
    .pipe($.cheerio({
      run: addPrefix,
      parserOptions: {
        decodeEntities: false
      }
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

gulp.task('deploy', gulp.series('build', gulp.parallel('prefix', 'images')));