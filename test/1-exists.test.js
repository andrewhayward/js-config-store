const test = require('tap').test

test('configStore exists', function (t) {
  var configStore = require('..');
  t.type(configStore, 'function', 'configStore is a function');
  t.end();
});
