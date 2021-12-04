(function () {
	'use strict';

	let gulp = require('gulp'),
		babel = require('gulp-babel'),
		plumber = require('gulp-plumber'),
		uglify = require('gulp-uglify'),
		concat = require('gulp-concat'),
		cssmin = require('gulp-clean-css'),
		less = require('gulp-less');

	const arr = [
		{name: 'admin', file: ['public/app/admin/**/*.js']},
		{name: 'app', file: 'public/app/admin/*.js'},
		{name: 'main', file: 'public/app/admin/main/*.js'},
		{name: 'information', file: 'public/app/admin/information/**/*.js'},
		{name: 'person', file: 'public/app/admin/person/**/*.js'},
		{name: 'car', file: 'public/app/admin/car/**/*.js'},
		{name: 'common', file: 'public/app/common/**/*.js'},
	];

	//****** DEV Tasks *******//
	for (let i = 0; i < arr.length; i++) {
		gulp.task(arr[i].name + '-dev', ()=> {
			return gulp.src(arr[i].file)
				.pipe(require('gulp-jshint')())
				.pipe(concat(arr[i].name + '.min.js'))
				.pipe(gulp.dest('./public/dist'))
				.pipe(require('gulp-livereload')());
		});
	}
//*********less dev*********//
	let lessArr = [
		{name: 'app-less', file: 'public/app/less/**/*.less'}
	];

	for (let i = 0; i < lessArr.length; i++) {
		gulp.task(lessArr[i].name + '-dev', ()=> {
			return gulp.src(lessArr[i].file)
				.pipe(less())
				.pipe(concat(lessArr[i].name + '.min.css'))
				.pipe(gulp.dest('./public/dist/css'))
				.pipe(require('gulp-livereload')());
		});
	}

	//******* PRODUCTION Task ************//
	for (let i = 0; i < arr.length; i++) {
		gulp.task(arr[i].name, ()=> {
			return gulp.src(arr[i].file)
				.pipe(babel({
					plugins: [
						'@babel/plugin-transform-for-of'
					],
					//presets: ['env']
					presets: ['@babel/env']
				}))
				.pipe(uglify({mangle: false}))
				.pipe(concat(arr[i].name + '.min.js'))
				.pipe(gulp.dest('./public/dist'));
		});
	}

	//*********Production less*********//
	for (let i = 0; i < lessArr.length; i++) {
		gulp.task(lessArr[i].name, ()=> {
			return gulp.src(lessArr[i].file)
				.pipe(plumber())
				.pipe(less())
				.pipe(cssmin())
				.pipe(concat(lessArr[i].name + '.min.css'))
				.pipe(gulp.dest('./public/dist/css'))
				.pipe(plumber.stop());
		});
	}

	// pug Task
	gulp.task('pug', () => gulp.src(['public/app/**/*.pug', 'server/views/*.pug']));

	// clean Task
	gulp.task('clean', () => gulp.src('./public/dist/*').pipe(require('gulp-clean')()));

	gulp.task('watch', () => {
		//require('gulp-livereload').listen();
		require('gulp-livereload').listen(35720, function(err) {
			if(err){
				console.log(err);
			}
		});
		for (let i = 0; i < arr.length; i++) {
			gulp.watch(arr[i].file, {usePolling: true}, gulp.parallel(arr[i].name + '-dev'));
		}
		for (let i = 0; i < lessArr.length; i++) {
			gulp.watch(lessArr[i].file, {usePolling: true}, gulp.parallel(lessArr[i].name + '-dev'));
		}

		gulp.watch(['public/app/**/*.pug', 'server/views/*.pug'], gulp.parallel('pug')).on('change', file => {
			gulp.src(file).pipe(require('gulp-livereload')());
		});
	});

	let taskDev = [];
	let task = [];
	for (let i = 0; i < lessArr.length; i++) {
		taskDev.push(lessArr[i].name + '-dev');
		task.push(lessArr[i].name);
	}
	for (let i = 0; i < arr.length; i++) {
		taskDev.push(arr[i].name + '-dev');
		task.push(arr[i].name);
	}
	let env = process.env.NODE_ENV || 'dev';
	if(env == 'dev'){
		gulp.task('default', gulp.series('clean', gulp.parallel(taskDev), 'watch'));
	}else{
		gulp.task('default',gulp.parallel(task));
	}

	//gulp.task('default', gulp.series('clean', gulp.parallel(taskDev), 'watch'));
	//gulp.task('default',gulp.parallel(task));
	//gulp.task('heroku:staging', gulp.parallel(task));
	//gulp.task('heroku:production', gulp.parallel(task));
}());
