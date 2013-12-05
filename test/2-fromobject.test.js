const test = require('tap').test
const configStore = require('..');

test('configStore can be generated from an object', function (t) {
  function runTests (config) {
    t.ok(config, 'config generated');
    t.type(config, 'function', 'config is a function');
  }

  var config = configStore({});
  runTests(config);

  t.test('also works with a callback', function (t) {
    configStore({}, function (err, config) {
      t.notOk(err, 'No errors thrown');
      runTests(config);
      t.end();
    });
  });

  t.end();
});

test('configStore finds keys correctly', function (t) {
  var obj = {
    test: 1,
    nested: {
      test: 2
    }
  };

  function runTests (config) {
    var a = config('test', 2);
    t.equal(a, 1, '`test` found, correct value returned');

    var b = config('missing', 2);
    t.equal(b, 2, '`missing` not found, fallback value returned');

    t.throws(config.bind(null, 'missing'), '`missing` not found, error thrown with no fallback value');

    var c = config('nestedTest', 1);
    t.equal(c, 2, '`nestedTest` found, correct value returned');
  }

  var config = configStore(obj);
  runTests(config);

  t.test('also works with a callback', function (t) {
    configStore(obj, function (err, config) {
      t.notOk(err, 'No errors thrown');
      runTests(config);
      t.end();
    });
  });

  t.end();
});
