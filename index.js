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

function replaceString(a,b,c) {
	return a.replace(new RegExp(b.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),'g'),c.replace(/\$/g,'$$$$'));
}


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
		include = new RegExp(p.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")+'include\\(([^\)]*)\\)','g');

	return through.obj(function (file, enc, cb) {

		// Check file
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError(plugin,'Streaming not supported'));
			return cb();
		}

		// Get file contents & path
		var contents = file.contents.toString(),
			root = file.cwd,
			base = file.base.replace(root,'').replace(/^[\\\/]/,'').replace(/\\/g,'/'),
			path = base.replace(options.src,''),
			filename = file.path.replace(file.base,'');
		
		// File includes (@@include)
		var result = contents.replace(include,function(a,b) {
			var includePath = (options.dist) ? options.dist+path : base
			return glob.sync(includePath+b).map(function(c) {
				return fs.readFileSync(c).toString();
			}).join('');
		});
		
		// @@file and @@path
		result = replaceString(result,p+'file',filename);
		result = replaceString(result,p+'path',path);
		
		// Replace global variables
		_.each(global,function(a,b) {
			result = replaceString(result,p+b,a);
		});

		// Replace page-specific variables
		if(_.has(options.pages,path+filename)) {

		_.each(options.pages[path+filename],function(a,b) {
				//result = result.replace(p+b,a);
				result = replaceString(result,p+b,a);
			});
		}	
		
		file.contents = new Buffer(result);

		this.push(file);
		cb();
	});

};
