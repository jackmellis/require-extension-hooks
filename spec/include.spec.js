import test from 'ava';
import hooks from '../src';
import path from 'path';

test.beforeEach(t => {
  hooks('js').splice(0);
  Object.keys(require.cache)
    .filter(key => key.indexOf('spec/files') > -1)
    .forEach(key => delete require.cache[key]);
});

test('includes a hook based on a function', t => {
  var called = 0;
  hooks('js')
    .include(({filename}) => filename.includes('include.js'))
    .push(() => called++);

  t.is(called, 0);

  require('./files/include.js');
  t.is(called, 1);

  require('./files/exclude.js');
  t.is(called, 1);
});

test('includes a hook based on a pattern', t => {
  var called = 0;
  var called = 0;
  hooks('js')
    .include('**/files/inc*.js')
    .push(() => called++);

  t.is(called, 0);

  require('./files/include.js');
  t.is(called, 1);

  require('./files/exclude.js');
  t.is(called, 1);
});

test('includes a hook based on a string', t => {
  var called = 0;
  var called = 0;
  hooks('js')
    .include(path.join(__dirname, './files/include.js'))
    .push(() => called++);

  t.is(called, 0);

  require('./files/include.js');
  t.is(called, 1);

  require('./files/exclude.js');
  t.is(called, 1);
});

test('includes and excludes files', t => {
  var called = 0;
  hooks('js')
    .include('**/files/*clude.js')
    .exclude('**/files/ex*.js')
    .push(() => called++);

  t.is(called, 0);

  require('./files/include.js');
  t.is(called, 1);

  require('./files/exclude.js');
  t.is(called, 1);

  require('./files/js');
  t.is(called, 1);
});
