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

    t.throws(config.bind(null, 'nested'), '`nested` not found, error thrown with no fallback value');

    t.equal(config('NESTED_TEST'), 2, '\'var\' style works as expected');
    t.equal(config('nestedTest'), 2, '\'camel case\' works as expected');
    t.equal(config('nested.test'), 2, '\'dot notation\' works as expected');

    var c = config.find('test');
    t.equal(c, a, '`find` works as expected with simple look-ups');

    var d = config.find('missing', 2);
    t.equal(d, b, '`find` works as expected with fallback values');

    var e = config.find('nested', {});
    t.deepEqual(e, {test: 2}, '`nested` found, correct value returned');

    var f = config.find('nested.test');
    t.equal(f, 2, '`nested.test` found, correct value returned');
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
