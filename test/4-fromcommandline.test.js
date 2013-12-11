const test = require('tap').test

test('configStore can be generated from command-line args', function (t) {

  process.argv.push('--thingA', 'foo', '--thingB', 'bar');

  const configStore = require('..');  // nb: reads argv on module import

  var config = configStore();
  t.equal(config('THING_A'), 'foo');
  t.equal(config('THING_B'), 'bar');
  t.deepEqual(config('THING'), {A: 'foo', B: 'bar'});
  t.end();
});