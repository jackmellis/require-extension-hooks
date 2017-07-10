import test from 'ava';
import hooks from '../src';
import path from 'path';

test.beforeEach(t => {
  hooks('js').splice(0);
  Object.keys(require.cache)
    .filter(key => key.indexOf('spec/files') > -1)
    .forEach(key => delete require.cache[key]);
});

test('excludes a hook based on a function', t => {
  var called = 0;
  hooks('js')
    .exclude(({filename}) => filename.includes('exclude.js'))
    .push(() => called++);

  t.is(called, 0);

  require('./files/include.js');
  t.is(called, 1);

  require('./files/exclude.js');
  t.is(called, 1);
});

test('excludes a hook based on a pattern', t => {
  var called = 0;
  var called = 0;
  hooks('js')
    .exclude('**/files/ex*.js')
    .push(() => called++);

  t.is(called, 0);

  require('./files/include.js');
  t.is(called, 1);

  require('./files/exclude.js');
  t.is(called, 1);
});

test('excludes a hook based on a string', t => {
  var called = 0;
  var called = 0;
  hooks('js')
    .exclude(path.join(__dirname, './files/exclude.js'))
    .push(() => called++);

  t.is(called, 0);

  require('./files/include.js');
  t.is(called, 1);

  require('./files/exclude.js');
  t.is(called, 1);
});
