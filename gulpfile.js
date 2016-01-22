const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const notify = require("gulp-notify");
const packageJson = require("./package.json");

gulp.task('build', function() {
    return gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel(packageJson.babel))
        .on("error", notify.onError("Error: <%= error.message %>"))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('lib'))
        .pipe(notify({
            title: packageJson.name,
            message: "Compiled.",
            onLast: true
        }));
});

gulp.task('watch', function() {
    gulp.watch(['./src/**/*.js'], ['build']);
});

gulp.task('default', ['watch'])
