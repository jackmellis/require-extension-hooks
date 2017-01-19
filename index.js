const cache = {};
const m = require('module');

const hookFn = require('./hook');

class Api{
  constructor(extensions, options){
    this._extensions = extensions;
  }
  push(fn){
    if (this._plugin && !fn){
      fn = this._plugin;
    }
    this._extensions.forEach(ext => ext.push(fn));
    return this;
  }
  shift(fn){
    if (this._plugin && !fn){
      fn = this._plugin;
    }
    this._extensions.forEach(ext => ext.shift(fn));
    return this;
  }
  splice(){
    let args = arguments;
    if (this._plugin && args.length < 3){
      args[2] = this._plugin;
    }
    this._extensions.forEach(ext => ext.splice.apply(ext, args));
    return this;
  }
  count(){
    return this._extensions.length ? this._extensions[0].length : 0;
  }
  plugin(name){
    if (typeof name === 'function'){
      this._plugin = name;
    }else{
      try{
        this._plugin = require('require-extension-hooks-' + name);
      }catch(e){
        this._plugin = require(name);
      }
    }

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
