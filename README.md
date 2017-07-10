# require-extension-hooks
Add hooks for js extension types

## Installation  
`npm install require-extension-hooks --save-dev`

## Usage  
```javascript
var hooks = require('require-extension-hooks');

hooks('.js').push(function ({content}) {
  return '/* Before */' + content + '/* After */';
});
```

require-extension-hooks intercepts node's module loading system and allows you to queue up multiple *loaders* that can transpile the content before it is compiled.  

The advantage of using require-extension-hooks over something like babel-register is that babel-register is only written for a single purpose, it is difficult to insert further transpilers at the same time. require-extension-hooks allows for as many hooks as you need.  

## API  
### hook(extension)  
The main hook function takes an extension string as its only argument. The preceding . is optional. The function can also accept an array of strings, any functions passed to the hook will be applied to all supplied extensions.  
The function will return a hook object with a number of methods available:  

### hook.push(fn)  
Pushes a function onto the queue of hooks for this extension.  

### hook.unshift(fn)  
Inserts a function at the start of the queue of hooks for this extension.  

### hook.pop()
Removes the latest hook from the current extension.

### hook.shift()
Removes the first hook from the current extension.

### hook.splice(index, remove, fn1, fn2, ...)  
Acts like [].splice() for inserting and removing functions.  

### hook.count()  
Returns the number of hooks queued up for this extension. If hook was called with multiple extensions, it will return the count of the first extension.  

### hook.plugin(name | fn)  
Loads a plugin.

The plugin can either be a partial name (i.e. for *require-extension-hooks-vue* you can just type `hook.plugin('vue')`), the full name of a plugin (i.e. `hook.plugin('require-extension-hooks-vue')`) or a direct function (i.e. `hook.plugin(function(config){}`).  

The plugin is automatically added to the hook queue. You can move it to the start of the queue by calling `hook.plugin('xxx').unshift()`.

### include(pattern | fn)
Restricts the hook to only run based on the provided pattern. The argument can be either a function (that takes the same configuration options as the hook itself), or a **glob** pattern that is matched against the filename.
```js
// these 2 examples will both only run for files in the node_modules folder
hooks('js').include('**/node_modules/**/*.js').push(...);
hooks('js').include(({filename}) => filename.includes('node_modules'));
```

### exclude(pattern | fn)
Restricts the hook to skip files that do not match the provided pattern. The argument can be either a function (that takes the same configuration options as the hook itself), or a **glob** pattern that is matched against the filename.
```js
// these 2 examples will both EXCLUDE any files from the node_modules folder
hooks('js').exclude('**/node_modules/**/*.js').push(...);
hooks('js').exclude(({filename}) => filename.includes('node_modules'));
```

It is possible to chain multiple include and exclude patterns, the file must match all of the patterns to continue.

### config  
```js
hooks('js').push(function ({filename, content, stop, cancel, sourceMap, hook}) {
  ...
})
```
A hook function takes a config object as its only argument. This object contains the following options:  
#### filename  
  The name of the file being read in.  
#### content  
  The content of the file.  
#### stop  
  Call this function to stop the queue. The value returned from the current function will be used as the final value. All subsequent hook functions will be skipped.  
#### cancel  
  Don't use the return value of this function and continue to the next.  
#### sourceMap  
  A pre-initialised source map object. This is an instance of [SourceMapGenerator](https://www.npmjs.com/package/source-map) and be used to create a source map for the current hook.  
### inputSourceMap  
  The source map object from any previous transpilations. You don't need to manually merge the input source map into your current source map as this is automatically calculated.  
#### hook
  The `hook` method allows you to parse a file's content through another extension and return the transpiled content. This is useful if you have a file that contains multiple languages.
  ```js
hooks('.custom').push(function ({content, hook}) {
  let {javascriptPart, typescriptPart} = extractStuff(content);
  let transpiledTypescriptPart = hook('.ts', typescriptPart);
  return `${javascriptPart}\n${transpiledTypescriptPart}`;
})
```
The hook method takes a file extension as its first parameter. The second parameter can be one of the following:
- `String` - assumed to be the content you want to parse.
- `{content : String}` - same as passing content directly.
- `{content : String, filename : String}` - passes the content to the hook but with a custom filename.
- `{filename : String}` - pass in a custom filename and it will read in and transpile that file's content.

If you do not pass any parameters into the `hook` method, it will pass in the current content and filename.

#### return  
The hook function *must* return a value. If no value is returned, the next hook is automatically called instead.  
If the return value is a string, this will be treated as the file contents.  
If the return value is an object, the filename, content, and sourceMap will be extracted from it.  
It can also just return the config object directly.  


## Source Maps  
require-extension-hooks contains some helpers for creating source maps for your hooks. Each hook has access to a sourceMap object which can be used to map the previous content to the new content. Each hook does not need to know about the previous one. Once all of the hooks have completed, the source maps are combined and appended to the content as a comment.  
```javascript
hooks('vue').push(function ({filename, content, sourceMap}) {
  // do some transpiling...
  sourceMap.addMapping({
    source : filename,
    original : {
      line : 1,
      column : 1
    },
    generated : {
      line : 2,
      column : 2
    }
  });
});

hooks(['vue', 'js']).push(function ({filename, content, sourceMap}) {
  // do some more transpiling
  // create another source map, we don't care whether the previous hook created a source map or not
  sourceMap.addMapping({ ... });
});

require('something.vue'); // will contain something like //# sourceMappingURL=datblahblah
```
