import test from 'ava';
import hooks from '../src';
import path from 'path';

test.beforeEach(t => {
  hooks('js').splice(0);
  Object.keys(require.cache)
    .filter(key => key.indexOf('spec/files') > -1)
    .forEach(key => delete require.cache[key]);
});

test('triggers a hook from another hook', t => {
  hooks('js').push(function ({content, hook}) {
    return `${hook('js2')}exports.isJsFile=true;`;
  });
  hooks('js2').push(function ({content}) {
    return `${content}exports.isJs2File=true;`;
  });

  var result = require('./files/js');

  t.is(result.a, 'A');
  t.true(result.isJsFile);
  t.true(result.isJs2File);
});

test('triggers a hook with custom content', t => {
  hooks('js').push(function ({content, hook}) {
    return hook('js2', 'exports.isJsFile=true;');
  });
  hooks('js2').push(function ({content}) {
    return `${content}exports.isJs2File=true;`;
  });

  var result = require('./files/js');

  t.is(result.a, undefined);
  t.true(result.isJsFile);
  t.true(result.isJs2File);
});

test('triggers a hook with custom content object', t => {
  hooks('js').push(function ({content, hook}) {
    return hook('js2', {content : 'exports.isJsFile=true;'});
  });
  hooks('js2').push(function ({content}) {
    return `${content}exports.isJs2File=true;`;
  });

  var result = require('./files/js');

  t.is(result.a, undefined);
  t.true(result.isJsFile);
  t.true(result.isJs2File);
});

test('triggers a hook with custom filename and content', t => {
  hooks('js').push(function ({filename, hook}) {
    return hook('js2', {
      content : `exports.isJsFile='${filename}';`,
      filename : './js2.js2'
    });
  });
  hooks('js2').push(function ({content, filename}) {
    return `${content}exports.isJs2File='${filename}'`;
  });

  var result = require('./files/js');

  t.is(result.a, undefined);
  t.truthy(result.isJsFile);
  t.truthy(result.isJs2File);
  t.not(result.isJsFile, result.isJs2File);
  t.is(result.isJs2File, './js2.js2');
});

test('triggers a hook with a different filename', t => {
  hooks('js').push(function ({hook}) {
    const filename = path.join(__dirname, './files/js2.js2');
    return hook('js2', {filename});
  });
  hooks('js2').push(function ({content}) {
    return content;
  });

  var result = require('./files/js');

  t.is(result, 'custom file type');
});


test('throws if filename does not exist', t => {
  hooks('js').push(function ({hook}) {
    return hook('js', {filename : path.join(__dirname, './files/doesNotExist.js')});
  });

  t.throws(() => require('./files/js'));
});

test('throws if extension type does not exist', t => {
  hooks('js').push(function ({hook}) {
    return hook('unknown');
  });

  t.throws(() => require('./files/js'));
});
