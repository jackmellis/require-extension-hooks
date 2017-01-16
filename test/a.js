const hooks = require('..');
hooks('js')
.push(function ({content}) {
  return 'console.log("a");' + content;
})
.push(function ({content}) {
  return 'console.log("a2");' + content;
});

require('./b');
