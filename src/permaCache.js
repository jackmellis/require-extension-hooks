const path = require('path');
const cwd = path.resolve('.');
let permaCache;
try{
  permaCache = require(path.join(cwd, './.rehrc'));
  permaCache = Object.assign({
    enabled: true,
    match: (filename) => !filename.includes('node_modules'),
    path: path.join(__dirname, '../reh-cache'),
    cwd,
  }, permaCache);
}catch(e){
  permaCache = {
    enabled : false
  };
}

module.exports = permaCache;
