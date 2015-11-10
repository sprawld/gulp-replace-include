# gulp-replace-include

## Prefixed variable replacement and file includes

Gulp Replace-Include performs text replacement on prefixed (default @@) variables.
The prefix can be changed in the plugin options.
There are 5 types of variable:

- `@@file` and `@@path` : The current filename and file path (relative to the `src` directory)
- `@@include(fileglob*.txt)` : text file includes (path relative to current page)
- `@@require(glob/*.js)` : like `@@include`, but will ignore any files that have already been required
- Global variables : variables and their replacement (provided as a key:value pairs) applied to all files
- Page variables : variables assigned to specific page path/filenames (relative to the `src` directory)

### Options

```javascript
{
   prefix: '@@',    // prefix for all variables
   src: '',         // source root folder
   dist: '',        // base folder for file includes
   global: {},      // global variables (variable:replacement) pairs
   pages: {},       // page variables (path/filename:global variable object) pairs
}
```

If the base folder for all your source files is not where your gulpfile is, you can set the `src` directory.
You can also provide a different directory (`dist`) for the file includes and requires.
Useful if you want to, for example, inline minified CSS or Javascript.


### Gulp example

```
+-- build
|   +-- gulpfile.js
+-- src
|   +-- test
|       +-- 1.html
|       +-- 2.html
+-- dist
    +-- welcome.txt
```

#### build/gulpfile.js

```javascript

var gulp = require('gulp');
var replaceInclude = require('gulp-replace-include');

gulp.task('default',function() {
	
	return gulp.src('../src/**/*.html')
		.pipe(replaceInclude({
			src: '../src/',
			dist: '../dist/',
			global: {
				"hello": "Howdy",
			},
			pages: {
				"test/1.html" : {
					title: "First Page",
				},
				"test/2.html" : {
					title: "Second Page",
				}
			}
		}))
		.pipe(gulp.dest('../dist/'));
	
});
```

Will convert two files `src/test/1.html` & `src/test/2.html`, each with content:

```html
<html>
  <head>
    <title>@@title</title>
    <link rel="canonical" href="example.com/@@path@@file">
  </head>
  <body>
    <h1>Test Page: @@file</h1>
	<p>@@include(../welcome.txt)</p>
  </body>
</html>
```

With a text file `dist/welcome.txt`:

```text
@@hello World
```

Will produce:

```
+-- dist
|   +-- test
|       +-- 1.html
|       +-- 2.html
```

#### dist/test/1.html

```html
<html>
  <head>
    <title>First Page</title>
    <link rel="canonical" href="example.com/test/1.html">
  </head>
  <body>
    <h1>Test Page: 1.html</h1>
	<p>Howdy World</p>
  </body>
</html>
```


#### dist/test/2.html
```html
<html>
  <head>
    <title>Second Page</title>
    <link rel="canonical" href="example.com/test/2.html">
  </head>
  <body>
    <h1>Test Page: 2.html</h1>
	<p>Howdy World</p>
  </body>
</html>
```

