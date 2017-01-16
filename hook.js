const fs = require('fs');
const path = require('path');

const {SourceMapGenerator} = require('source-map');
const convert = require('convert-source-map');
const merge = require('merge-source-map');

function hook(hooks, module, filename){
  let sys = {filename};
  let config = createConfigObject(sys);

  for (let x = 0, l = hooks.length; x < l && !sys.stop; x++){
    resetSys(sys);

    let result = hooks[x](config);

    if (sys.cancel){
      continue;
    }
    if (!result){
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
    config.content = convert.removeComments(config.content);
    config.content = [config.content, convert.fromObject(sys.masterMap).toComment()].join('\n');
  }

  module._compile(config.content, filename);
}

function createConfigObject(sys){
  let config = {
    filename : sys.filename,
    content : fs.readFileSync(sys.filename, 'utf8'),
    stop(){
      sys.stop = true;
    },
    cancel(){
      sys.cancel = true;
    }
  };
  Object.defineProperty(config, 'sourceMap', {
    get(){
      if (!sys.currentMap){
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
    sys.currentMap = convert.fromJSON(sys.currentMap).toObject();
  }else if (sys.currentMap instanceof SourceMapGenerator){
    // sys.currentMap was created from SourceMapGenerator and needs converting into an object
    sys.currentMap = convert.fromJSON(sys.currentMap.toString()).toObject();
  }else if (sys.currentMap === true){
    // true indicates the source map is in the source code
    sys.currentMap = convert.fromSource(config.content).toObject();
  }else{
    // Already formatted (in theory)
  }

  // Merge the old map with the new map
  if (!sys.masterMap){
    sys.masterMap = sys.currentMap;
  }else{
    sys.masterMap = merge(sys.masterMap, sys.currentMap);
  }
}

module.exports = hook;
