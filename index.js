/*!
 * gulp-replace-include
 * https://github.com/sprawld/gulp-replace-include/
 * MIT License
 */
'use strict';

var fs = require('fs'),
	glob = require('glob'),
	through = require('through2'),
	gutil = require('gulp-util'),
	path = require('path'),
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

	var prefix = options.prefix,
		global = options.global,
		prefixReg = prefix.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
		includeReg = new RegExp(prefixReg+'include\\(([^\)]*)\\)','g'),
		requireReg = new RegExp(prefixReg+'require\\(([^\)]*)\\)','g');

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
		var base = path.join(file.cwd, options.src),
			root = file.cwd,
			requireList = [],
			includeBase = path.join(file.cwd, options.dist),
			currentPath = path.relative(base, file.base).replace(/\\/g,'/').replace(/^(..*)$/,'$1/'),
			includePath = path.join(includeBase, currentPath),
			filename = file.path.replace(file.base,''),
			currentFile = path.join(currentPath,filename).replace(/\\/g,'/'),
			result = file.contents.toString();

		// File includes (@@include)
		while(result.match(includeReg)) {
			result = result.replace(includeReg,function(a,b) {
				return glob.sync(includePath+b).map(function(c) {
					return fs.readFileSync(c).toString();
				}).join('');
			});
		}

		// File requires (@@require)
		while(result.match(requireReg)) {
			result = result.replace(requireReg,function(a,b) {
				var fileList = glob.sync(includePath+b).map(path.normalize).filter(function(c) {
					return requireList.indexOf(c) == -1;
				});
				requireList = requireList.concat(fileList);
				
				return fileList.map(function(c) {
					return fs.readFileSync(c).toString();
				}).join('');
			});
		}
		
		// @@file and @@path
		result = replaceString(result,prefix+'file',filename);
		result = replaceString(result,prefix+'path',currentPath);
		
		// Replace global variables
		_.each(global,function(a,b) {
			result = replaceString(result,prefix+b,a);
		});

		// Replace page-specific variables
		if(_.has(options.pages,currentFile)) {
			_.each(options.pages[currentFile],function(a,b) {
				result = replaceString(result,prefix+b,a);
			});
		}	
		
		file.contents = new Buffer(result);

		this.push(file);
		cb();
	});

};
