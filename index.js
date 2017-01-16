const cache = {};
const m = require('module');

const hookFn = require('./hook');

class Api{
  constructor(extensions){
    this._extensions = extensions;
  }
  push(fn){
    this._extensions.forEach(ext => ext.push(fn));
    return this;
  }
  shift(fn){
    this._extensions.forEach(ext => ext.shift(fn));
    return this;
  }
  splice(){
    let args = arguments;
    this._extensions.forEach(ext => ext.splice.apply(ext, args));
    return this;
  }
}

function main(extensions){
  extensions = [].concat(extensions)
    .map(function (ext) {
      if (ext[0] !== '.'){
        ext = '.' + ext;
      }
      let hooks = cache[ext];
      if (!hooks){
        hooks = [];
        cache[ext] = hooks;
        m._extensions[ext] = hookFn.bind(null, hooks);
      }
      return hooks;
    });

  return (new Api(extensions));
}

module.exports = main;
