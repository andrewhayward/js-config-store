const test = require('tap').test

test('configStore can be generated from environment', function (t) {

  process.env['THING_A'] = 'foo';
  process.env['THING_B'] = 'bar';

  const configStore = require('..');  // nb: reads env on module import

  var config = configStore();
  t.equal(config('THING_A'), 'foo');
  t.equal(config('THING_B'), 'bar');
  t.deepEqual(config('THING'), {A: 'foo', B: 'bar'});
  t.end();
});