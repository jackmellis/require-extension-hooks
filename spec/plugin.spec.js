import test from 'ava';
import hooks from '../src';
import path from 'path';

test.beforeEach(t => {
  hooks('js').splice(0);
  Object.keys(require.cache)
    .filter(key => key.indexOf('spec/files') > -1)
    .forEach(key => delete require.cache[key]);
});

test('accepts a plugin function', t => {
  var count = 0;
  hooks('js').plugin(function ({content}) {
    count++;
    return `${content};exports.a = 'Aye';exports.c = 'Cee'`;
  }).push();
  var result = require('./files/js');

  t.is(result.a, 'Aye');
  t.is(result.b, 'B');
  t.is(result.c, 'Cee');
  t.is(count, 1);
});

test('plugin does not have to be pushed', t => {
  var count = 0;
  hooks('js').plugin(function ({content}) {
    count++;
    return `${content};exports.a = 'Aye';exports.c = 'Cee'`;
  });
  var result = require('./files/js');

  t.is(result.a, 'Aye');
  t.is(result.b, 'B');
  t.is(result.c, 'Cee');
  t.is(count, 1);
});

test('plugin can be unshifted instead of pushed', t => {
  var hookCalled;
  var pluginCalled;
  hooks('js').push(function () {
    hookCalled = true;
  });
  hooks('js').plugin(function () {
    pluginCalled = !hookCalled;
  }).unshift();

  require('./files/js');

  t.true(hookCalled);
  t.true(pluginCalled);
});

test('loads a plugin from a file', t => {
  hooks('js').plugin(path.join(__dirname, './files/plugin.js'));
  var result = require('./files/js');

  t.is(result, 'plugin');
});
