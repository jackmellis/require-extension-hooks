const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const cache = require('./cache');
const permaCache = require('./permaCache');
const cwd = path.resolve('.');
const requireCache = {};
function requireIf(path){
  if (!requireCache[path]){
    requireCache[path] = require(path);
  }
  return requireCache[path];
}

function hook(hooks, module, filename){
  const useCache = permaCache.enabled && permaCache.match(filename);
  if (useCache){
    const cached = getCachedFile(filename);
    if (cached !== false){
      compile(module, cached, filename);
      return;
    }
  }

  const content = fs.readFileSync(filename, 'utf8');
  const transpiled = transpile(hooks, filename, content);

  if (useCache){
    setCachedFile(filename, transpiled);
  }

  compile(module, transpiled, filename);
}

function transpile(hooks, filename, content){
  let sys = {filename, content};
  let config = createConfigObject(sys);

  for (let x = 0, l = hooks.length; x < l && !sys.stop; x++){
    resetSys(sys);

    let result = hooks[x](config);

    if (sys.cancel){
      continue;
    }
    if (!result && typeof result !== 'string'){
      continue;
    }

    processResult(config, result, sys);

    // Check if a source map has been produced
    if (sys.useMap && sys.currentMap){
      processSourceMap(sys, config);
    }

    // Stop looping
    if (sys.stop){
      break;
    }
  }

  // Inline the source map in the content
  if (sys.masterMap){
    let convert = requireIf('convert-source-map');
    config.content = convert.removeComments(config.content);
    config.content = [config.content, convert.fromObject(sys.masterMap).toComment()].join('\n');
  }

  return config.content;
}

function compile(module, content, filename){
  module._compile(content, filename);
}

function createConfigObject(sys){
  let config = {
    filename : sys.filename,
    content : sys.content,
    stop(){
      sys.stop = true;
    },
    cancel(){
      sys.cancel = true;
    },
    hook : oneTimeHook.bind(null, sys)
  };
  Object.defineProperty(config, 'sourceMap', {
    get(){
      if (!sys.currentMap){
        const {SourceMapGenerator} = requireIf('source-map');
        sys.currentMap = new SourceMapGenerator({file : sys.filename});
      }
      return sys.currentMap;
    },
    set(v){
      sys.currentMap = v;
      sys.useMap = true;
    }
  });
  Object.defineProperty(config, 'inputSourceMap', {
    get(){
      return sys.masterMap;
    }
  });
  return config;
}

function oneTimeHook(sys, ext, config){
  if (ext[0] !== '.'){
    ext = '.' + ext;
  }
  const hooks = cache[ext];
  if (!hooks){
    throw new Error(`Unknown file extension ${ext}`);
  }

  if (typeof config === 'string'){
    config = {content : config};
  }
  if (!config){
    config = {};
  }
  if (config.content === undefined){
    if (config.filename){
      try{
        config.content = fs.readFileSync(config.filename);
      }catch(err){
        throw new Error(`Cannot find module '${config.filename}'`);
      }
    }else{
      config.content = sys.content;
    }
  }
  if (!config.filename){
    config.filename = sys.filename;
  }

  return transpile(hooks, config.filename, config.content);
}

function resetSys(sys){
  sys.currentMap = null;
  sys.useMap = false;
  sys.stop = false;
  sys.cancel = false;
}

function processResult(config, result, sys){
  // Could either return string content, an object, or the actual config object
  if (typeof result === 'string'){
    config.content = result;
  }else if (config !== result){
    config.filename = result.filename || config.filename;
    config.content = result.content || config.content;
    config.sourceMap = result.sourceMap || sys.currentMap;
  }
}

function processSourceMap(sys, config){
  if (typeof sys.currentMap === 'string'){
    // sys.currentMap is a json string
    sys.currentMap = requireIf('convert-source-map').fromJSON(sys.currentMap).toObject();
  }else if (sys.currentMap instanceof requireIf('source-map').SourceMapGenerator){
    // sys.currentMap was created from SourceMapGenerator and needs converting into an object
    sys.currentMap = requireIf('convert-source-map').fromJSON(sys.currentMap.toString()).toObject();
  }else if (sys.currentMap === true){
    // true indicates the source map is in the source code
    sys.currentMap = requireIf('convert-source-map').fromSource(config.content).toObject();
  }else{
    // Already formatted (in theory)
  }

  // Merge the old map with the new map
  if (!sys.masterMap){
    sys.masterMap = sys.currentMap;
  }else{
    sys.masterMap = requireIf('merge-source-map')(sys.masterMap, sys.currentMap);
  }
}

function getCachedFilepath(filepath){
  return path.join(
    permaCache.path,
    filepath.replace(permaCache.cwd, '')
  );
}

function getCachedFile(filepath){
  const tmpFilepath = getCachedFilepath(filepath);
  let tmpLastUpdated = 0;
  try{
    tmpLastUpdated = fs.statSync(tmpFilepath).mtimeMs;
  }catch(e){
    return false;
  }
  const lastUpdated = fs.statSync(filepath).mtimeMs;
  if (lastUpdated >= tmpLastUpdated){
    return false;
  }
  return fs.readFileSync(tmpFilepath, 'utf8');
}

function setCachedFile(filepath, content){
  const tmpFilepath = getCachedFilepath(filepath);
  const tmpDirname = path.dirname(tmpFilepath);
  mkdirp.sync(tmpDirname);
  fs.writeFileSync(tmpFilepath, content, 'utf8');
}

module.exports = hook;
