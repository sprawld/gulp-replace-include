/*
 * gulp-replace-include
 */

'use strict';

var fs = require('fs'),
	glob = require('glob'),
	through = require('through2'),
	gutil = require('gulp-util'),
	_ = require('lodash');

var plugin = 'gulp-replace-include';

module.exports = function(opts) {

	// defaults
	var options = _.extend({
		src: '',
		dist: '',
		prefix: '@@',
		global: {},
		pages: {},
	},opts);

	var p = options.prefix,
		global = options.global,
		include = new RegExp(p+'include\\(([^\)]*)\\)');

	return through.obj(function (file, enc, cb) {

		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError(plugin,'Streaming not supported'));
			return cb();
		}


		var contents = file.contents.toString(),
			root = file.cwd,
			base = file.base.replace(root,'').replace(/^[\\\/]/,'').replace(/\\/g,'/'),
			path = base.replace(options.src,''),
			filename = file.path.replace(file.base,'');
		
		//include files
		var result = contents.replace(include,function(a,b) {
			return glob.sync(options.dist+path+b).map(function(c) {
				return fs.readFileSync(c).toString();
			}).join('');
		}).replace(p+'file',filename).replace(p+'path',path);

		for(var i in global) {
			result = result.replace(p+i,global[i]);
		}
		
		if(_.has(options.pages,path+filename)) {
			var change = options.pages[path+filename];
			for(var i in change) {
				result = result.replace(p+i,change[i]);
			}
		}	
		
		file.contents = new Buffer(result);

		this.push(file);
		cb();
	});

};
