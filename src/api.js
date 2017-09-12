const minimatch = require('minimatch');

class Api{
  constructor(extensions, options){
    this._extensions = extensions;
    this._plugin = null;
    this._include = [];
    this._exclude = [];
  }
  push(fn){
    if (this._plugin && !fn){
      fn = this._plugin;
      this._removePlugin();
    }
    if (fn && typeof fn === 'function'){
      if (this._include.length){
        let fn2 = fn;
        fn = config => this._include.some(fn => fn(config)) && fn2(config);
      }
      if (this._exclude.length){
        let fn2 = fn;
        fn = config => this._exclude.every(fn => !fn(config)) && fn2(config);
      }
      this._extensions.forEach(ext => ext.push(fn));
    }
    return this;
  }
  pop(){
    this._extensions.forEach(ext => ext.pop());
  }
  unshift(fn){
    if (this._plugin && !fn){
      fn = this._plugin;
      this._removePlugin();
    }
    if (fn && typeof fn === 'function'){
      this._extensions.forEach(ext => ext.unshift(fn));
    }
    return this;
  }
  shift(){
    this._extensions.forEach(ext => ext.shift());
  }
  splice(){
    let args = arguments;
    if (this._plugin && args.length < 3){
      args[2] = this._plugin;
      this._plugin = null;
    }
    this._extensions.forEach(ext => ext.splice.apply(ext, args));
    return this;
  }
  count(){
    return this._extensions.length ? this._extensions[0].length : 0;
  }
  plugin(name, options){
    var fn;
    if (typeof name === 'function'){
      fn = name;
    }else{
      try{
        fn = require(`require-extension-hooks-${name}`);
      }catch(e){
        try{
          fn = require(name);
        }catch(e){

        }
      }
    }

    if (!fn || typeof fn !== 'function'){
      throw new Error(`Unable to find plugin ${name}`);
    }

    if (fn.configure && typeof fn.configure === 'function'){
      fn.configure(options);
    }

    this._plugin = fn;
    this.push();
    this._plugin = fn;

    return this;
  }
  include(pattern){
    switch (typeof pattern){
    case 'string':
      pattern = new minimatch.Minimatch(pattern);
      this._include.push(({filename}) => pattern.match(filename));
      break;
    case 'function':
      this._include.push(pattern);
      break;
    }
    return this;
  }
  exclude(pattern){
    switch (typeof pattern){
    case 'string':
      pattern = new minimatch.Minimatch(pattern);
      this._exclude.push(({filename}) => pattern.match(filename));
      break;
    case 'function':
      this._exclude.push(pattern);
      break;
    }
    return this;
  }

  _removePlugin(){
    this._extensions.forEach(ext => {
      let index = ext.indexOf(this._plugin);
      while (index > -1){
        ext.splice(index, 1);
        index = ext.indexOf(this._plugin);
      }
    });
    this._plugin = null;
  }
}

module.exports = Api;
