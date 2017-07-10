class Api{
  constructor(extensions, options){
    this._extensions = extensions;
  }
  push(fn){
    if (this._plugin && !fn){
      fn = this._plugin;
      this._removePlugin();
    }
    if (fn && typeof fn === 'function'){
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
  plugin(name){
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

    this._plugin = fn;
    this.push();
    this._plugin = fn;

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
