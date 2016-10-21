import eslint from 'gulp-eslint';
import gulp from 'gulp';

gulp.task('lint', () => {
  const glob = [
    '**/*.js',
    '!dist/**/*',
    '!node_modules'
  ];

  return gulp.src(glob)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('clean', () => {
  let del = require('del');

  return del(['dist/']);
});

gulp.task('build', ['clean'], () => {
  let babel = require('gulp-babel');

  return gulp.src('index.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['lint']);
