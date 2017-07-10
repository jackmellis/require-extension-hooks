import test from 'ava';
import hooks from '../src';
import path from 'path';

test.beforeEach(t => {
  hooks('js').splice(0);
  Object.keys(require.cache)
    .filter(key => key.indexOf('spec/files') > -1)
    .forEach(key => delete require.cache[key]);
});

test('loads in a regular js file', t => {
  hooks('js');
  var result = require('./files/js');
  t.is(result.a, 'A');
  t.is(result.b, 'B');
});

test('pushes a transpiler', t => {
  hooks('js').push(function ({content}) {
    return `${content};exports.a = 'Aye';exports.c = 'Cee'`;
  });
  var result = require('./files/js');

  t.is(result.a, 'Aye');
  t.is(result.b, 'B');
  t.is(result.c, 'Cee');
});

test('pops a transpiler', t => {
  hooks('js').push(function ({content}) {
    return `${content};exports.a = 'Aye';exports.c = 'Cee'`;
  });
  hooks('js').pop();
  var result = require('./files/js');

  t.is(result.a, 'A');
  t.is(result.b, 'B');
  t.is(result.c, undefined);
});

test('unshifts a transpiler', t => {
  hooks('js').unshift(function ({content}) {
    return `${content};exports.a = 'Aye';exports.c = 'Cee'`;
  });
  var result = require('./files/js');

  t.is(result.a, 'Aye');
  t.is(result.b, 'B');
  t.is(result.c, 'Cee');
});

test('shifts a transpiler', t => {
  hooks('js').unshift(function ({content}) {
    return `${content};exports.a = 'Aye';exports.c = 'Cee'`;
  });
  hooks('js').shift();
  var result = require('./files/js');

  t.is(result.a, 'A');
  t.is(result.b, 'B');
  t.is(result.c, undefined);
});

test('chains transpilers', t => {
  hooks('js')
    .push(function ({content}) {
      return `${content};exports.a='Aye';`;
    })
    .push(function ({content}) {
      return `${content};exports.b='Bee';`
    })
    .unshift(function ({content}) {
      return `${content};exports.c = exports.a`;
    });
  var result = require('./files/js');

  t.is(result.a, 'Aye');
  t.is(result.b, 'Bee');
  t.is(result.c, 'A');
});

test('returns a string', t => {
  hooks('js').push(function ({content}) {
    return `${content};exports.a = 'Aye';exports.c = 'Cee'`;
  });
  var result = require('./files/js');

  t.is(result.a, 'Aye');
  t.is(result.b, 'B');
  t.is(result.c, 'Cee');
});

test('returns an object', t => {
  hooks('js').push(function ({content}) {
    return {
      content : `${content};exports.a = 'Aye';exports.c = 'Cee'`
    };
  });
  var result = require('./files/js');

  t.is(result.a, 'Aye');
  t.is(result.b, 'B');
  t.is(result.c, 'Cee');
});

test('returns an empty string', t => {
  hooks('js').push(function ({content}) {
    return '';
  });
  var result = require('./files/js');

  t.is(result.a, undefined);
  t.is(result.b, undefined);
});

test('returns undefined - skips the transpiler', t => {
  hooks('js').push(function ({content}) {
    return;
  });
  var result = require('./files/js');

  t.is(result.a, 'A');
  t.is(result.b, 'B');
});

test('contains filename property', t => {
  hooks('js').push(({filename}) => `module.exports='${filename}'`);
  var result = require('./files/js');

  t.is(result, path.join(__dirname, './files/js.js'));
});

test('splices a hook', t => {
  hooks('js').push(function () {
    return 'module.exports = "original"';
  });
  hooks('js').splice(0, 1, function () {
    return 'module.exports = "spliced!"';
  });
  var result = require('./files/js');

  t.is(result, 'spliced!');
});

test('pushes a hook to multiple extensions', t => {
  var count = 0;
  hooks(['.js', 'js2']).push(function () {
    count++;
  });

  require('./files/js');
  t.is(count, 1);

  require('./files/js');
  t.is(count, 1);

  require('./files/js2');
  t.is(count, 2);

  require('./files/js2');
  t.is(count, 2);
});
