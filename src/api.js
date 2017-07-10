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
  pop(){
    this._extensions.forEach(ext => ext.pop());
  }
  unshift(fn){
    if (this._plugin && !fn){
      fn = this._plugin;
    }
    this._extensions.forEach(ext => ext.unshift(fn));
    return this;
  }
  shift(){
    this._extensions.forEach(ext => ext.shift());
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

module.exports = Api;
