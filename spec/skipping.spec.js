import test from 'ava';
import hooks from '../src';
import path from 'path';

test.beforeEach(t => {
  hooks('js').splice(0);
  Object.keys(require.cache)
    .filter(key => key.indexOf('spec/files') > -1)
    .forEach(key => delete require.cache[key]);
});

test('cancels the current transpilation', t => {
  hooks('js')
    .push(function ({content}) {
      return `${content}exports.c='C';`;
    })
    .push(function ({content, cancel}) {
      cancel();
      return `${content}exports.d='D';`
    })
    .push(function ({content}) {
      return `${content}exports.e='E';`
    });
  var result = require('./files/js');

  t.is(result.a, 'A');
  t.is(result.b, 'B');
  t.is(result.c, 'C');
  t.is(result.d, undefined);
  t.is(result.e, 'E');
});

test('stops after the current transpilation', t => {
  hooks('js')
    .push(function ({content}) {
      return `${content}exports.c='C';`
    })
    .push(function ({content, stop}) {
      stop();
      return `${content}exports.d='D';`
    })
    .push(function ({content}) {
      return `${content}exports.e='E'`;
    })
  var result = require('./files/js');

  t.is(result.a, 'A');
  t.is(result.b, 'B');
  t.is(result.c, 'C');
  t.is(result.d, 'D');
  t.is(result.e, undefined);
});

test('stops and cancels the current transpilation', t => {
  hooks('js')
    .push(function ({content}) {
      return `${content}exports.c='C';`
    })
    .push(function ({content, stop, cancel}) {
      stop();
      cancel();
      return `${content}exports.d='D';`
    })
    .push(function ({content}) {
      return `${content}exports.e='E';`
    })
  var result = require('./files/js');

  t.is(result.a, 'A');
  t.is(result.b, 'B');
  t.is(result.c, 'C');
  t.is(result.d, undefined);
  t.is(result.e, undefined);
});
