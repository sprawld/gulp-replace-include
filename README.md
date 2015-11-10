# gulp-replace-include

## Prefixed variable replacement and file includes

Gulp Replace-Include performs text replacement on prefixed (default @@) variables.
The prefix can be changed in the plugin options.
There are 5 types of variable:

- `@@file` and `@@path` : global variables for the current filename and file path (relative to the `src` directory)
- `@@include(fileglob*.css)` : text file includes (file path relative to current page)
- `@@require(lib/*.js)` : like @@include, but only adds a file that has not already been required
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

Often you'll have all files in a source directory. You can set this `src` directory. This is the root folder for your files.

You can also provide the root of your destination folder `dist`.
This will point file includes to their destination folder counterpart.
Useful if you want to, for example, inline minified CSS or Javascript.


### Gulp example

```
+-- build
|   +-- gulpfile.js
+-- src
|   +-- test1.html
|   +-- test2.html
+-- dist
|   +-- welcome.txt
```

#### build/gulpfile.js

```javascript

var gulp = require('gulp');
var replaceInclude = require('gulp-replace-include');

gulp.task('default',function() {
	
	return gulp.src('src/*.html')
		.pipe(replaceInclude({
			src: '../src/',
			dist: '../dist/',
			global: {
				"hello": "Howdy",
			},
			pages: {
				"test1.html" : {
					title: "First Page",
				},
				"test2.html" : {
					title: "Second Page",
				}
			}
		}))
		.pipe(gulp.dest('dist/'));
	
});
```

Will convert two files `src/test1.html` & `src/test2.html`, each with content:

```html
<html>
  <head>
    <title>@@title</title>
    <link rel="canonical" href="example.com/@@file">
  </head>
  <body>
    <h1>@@hello World</h1>
	<p>@@include(welcome.txt)</p>
  </body>
</html>
```

With a text file `src/welcome.txt`:

```text
Welcome to this test page (@@file)
```

Will produce:

```
+-- dist
|   +-- test1.html
|   +-- test2.html
```

#### dist/test1.html

```html
<html>
  <head>
    <title>First Page</title>
    <link rel="canonical" href="example.com/test1.html">
  </head>
  <body>
    <h1>Howdy World</h1>
	<p>Welcome to this test page (test1.html)</p>
  </body>
</html>
```


#### dist/test2.html
```html
<html>
  <head>
    <title>Second Page</title>
    <link rel="canonical" href="example.com/test2.html">
  </head>
  <body>
    <h1>Howdy World</h1>
	<p>Welcome to this test page (test2.html)</p>
  </body>
</html>
```

