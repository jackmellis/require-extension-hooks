const cache = require('./cache');
const m = require('module');

const hookFn = require('./hook');
const Api = require('./api');

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
