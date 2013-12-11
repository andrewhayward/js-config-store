const test = require('tap').test
const configStore = require('..');

test('thing', function (t) {
  var config = configStore({
    one: {
      two: {
        three: 'value'
      }
    }
  });

  t.equal(config('ONE_TWO_THREE'), 'value');
  t.deepEqual(config('ONE_TWO'), {THREE: 'value'});
  t.deepEqual(config('ONE'), {TWO: {THREE: 'value'}, TWO_THREE: 'value'});
  t.end();
});