const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const debowerify = require('debowerify');
const babelify = require('babelify');
const cssnext = require('postcss-cssnext');
const $ = require('gulp-load-plugins')();
const minimist = require('minimist');
process.env.NODE_ENV = 'development';

const config = require('./config.json');

const knownOptions = {
  string: 'input',
  default: {input: 'text-cn.json'},
  alias: {i: 'input'}
};

const argv = minimist(process.argv.slice(2), knownOptions);

const taskName = argv._[0];
const articleDataFile = path.resolve(__dirname, 'model', argv.i);
const footerDataFile = path.resolve(__dirname, 'model/footer.json');
// const projectName = path.basename(argv.i, '.json');
const projectName = 'numbers-china';

function readFilePromisified(filename) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }
  );
}

gulp.task('mustache', function () {
  const DEST = '.tmp';

//   var analytics = false;

//   if (taskName === 'build' || taskName === 'deploy') {
// // include analytics patial at compile time in `build` and `deploy` task`.
//     analytics = true; 
//   }

  const dataFiles = [articleDataFile, footerDataFile];

  const promisedData = dataFiles.map(readFilePromisified);

  return Promise.all(promisedData)
    .then(function(contents) {
      return contents.map(JSON.parse);
    })
    .then(function(contents){
      var analytics = false;
      if (process.env.NODE_ENV === 'production') {
         analytics = true;
         contents[0].assetsPath = 'http://static.ftchinese.com/ftc-icons/';
      }  
      gulp.src('views/index.mustache')
        .pipe($.mustache({
          analytics: analytics,
          article: contents[0],
          footer: contents[1]
        }, {
          extension: '.html'
        }))
        .pipe($.size({
          gzip: true,
          showFiles: true
        }))
        .pipe(gulp.dest(DEST))
        .pipe(browserSync.stream({once: true}));
    })
    .catch(function(error) {
      console.log(error);
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

gulp.task('scripts', function() {
  const DEST = '.tmp/scripts/';

  var plugins = [];
  if (process.env.NODE_ENV === 'development') {
    plugins = [watchify];
  }
  const b = browserify({
    entries: 'client/js/main.js',
    debug: true,
    cache: {},
    packageCache: {},
    transform: [debowerify, babelify],
    // plugin: [watchify]
    plugin: plugins
  });

  b.on('update', bundle);
  b.on('log', $.util.log);

  return bundle();

  function bundle(ids) {
    $.util.log('Compiling JS...');
    if (ids) {
      console.log('Chnaged Files:\n' + ids);
    }   
    return b.bundle()
      .on('error', function(err) {
        $.util.log(err.message);
        browserSync.notify('Browerify Error!')
        this.emit('end')
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(DEST))
      .pipe(browserSync.stream({once:true}));
  }
});

gulp.task('lint', function() {
  return gulp.src('client/**/*.js')
    .pipe($.eslint({
        extends: 'eslint:recommended',
        globals: {
          'd3': true,
          'ga': true,
          'fa': true
        },
        rules: {
          semi: [2, "always"]
        },
        envs: [
          'browser'
        ]
    }))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());  
});

gulp.task('serve', 
  gulp.parallel(
    'mustache', 'styles', 'scripts', 

    function serve() {
    browserSync.init({
      server: {
        baseDir: ['.tmp', 'client'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch('client/**/*.{csv,svg,png,jpg}', browserSync.reload);
    gulp.watch('client/scss/**/*.scss', gulp.parallel('styles'));
    gulp.watch(['views/**/**/*.mustache', 'model/*.json'], gulp.parallel('mustache'));
    gulp.watch('client/js/*.js', gulp.parallel('scripts'));
    //gulp.watch('client/**/*.js', gulp.parallel('lint'));
  })
);

gulp.task('serve:dist', function() {
  browserSync.init({
    server: {
      baseDir: ['dist'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

// Set NODE_ENV in gulp task.
// Mainly used to produce different mustache results.
// Any easy way to set it?
gulp.task('dev', function() {
  return Promise.resolve(process.env.NODE_ENV = 'development')
    .then(function(value) {
      console.log('NODE_ENV: ' + process.env.NODE_ENV);
    });
});

gulp.task('prod', function() {
  return Promise.resolve(process.env.NODE_ENV = 'production')
    .then(function(value) {
      console.log('NODE_ENV: ' + process.env.NODE_ENV);
    });
});

gulp.task('noenv', function() {
  return Promise.resolve(process.env.NODE_ENV = null)
    .then(function(value) {
      console.log('NODE_ENV: ' + process.env.NODE_ENV);
    });
});

/* demo */
gulp.task('demo:copy', function() {
  const dest = path.resolve(__dirname, config.demo, 'numbers');
  console.log('Copying demo to: ' + dest);
  return gulp.src(['.tmp/**/*.*', 'client/**/*.{svg,png,jpg,jpeg,gif}'])
    .pipe($.size({
      gzip: true,
      showFiles: true
    }))
    .pipe(gulp.dest(dest));  
});

gulp.task('demo', gulp.series('noenv', 'clean', 'styles', 'scripts', 'mustache', 'dev'));

/* build */
gulp.task('html', function() {
  return gulp.src('.tmp/index.html')
    // .pipe($.useref({searchPath: ['.', '.tmp']}))
    // .pipe($.if('*.js', $.uglify()))
    // .pipe($.if('*.css', $.cssnano()))
    .pipe($.htmlReplace(config.static))
    .pipe($.smoosher())
    .pipe(gulp.dest('dist'));
});

gulp.task('extras', function () {
  return gulp.src('client/**/*.csv', {
    dot: true
  })
  .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('client/**/*.{svg,png,jpg,jpeg,gif}')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('mustache', 'styles', 'scripts', 'images', 'extras'), 'html', 'dev'));


/**********deploy***********/
gulp.task('deploy:assets', function() {
  console.log('Deploying assets to: ' + path.resolve(__dirname, config.deploy.assets));
  return gulp.src(['dist/**/*.{csv,png,jpg,svg}'])
    .pipe($.size({
      gzip: true,
      showFiles: true
    }))
    .pipe(gulp.dest(config.assets))
});

gulp.task('deploy:html', function() {
  console.log('Deploying HTML file to: ' + path.resolve(__dirname, config.deploy.index));
  return gulp.src('dist/index.html')
    .pipe($.prefix(config.prefixUrl, [
      { match: "object[data]", attr: "data" }
    ]))
    .pipe($.rename({
      basename: projectName,
      extname: '.html'
    }))
    .pipe($.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe($.size({
      gzip: true,
      showFiles: true
    }))
    .pipe(gulp.dest(config.index));
    // .pipe(gulp.dest('.'));
});


gulp.task('deploy', gulp.series('build', gulp.parallel('deploy:assets', 'deploy:html')));