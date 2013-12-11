(function () {

  var root = this,
      previousStore,
      argv = getArgv(),
      env = getEnv();

  if (root !== null) {
    previousStore = root.configStore;
  }

  function configStore (config, callback) {
    function done (err, store) {
      if (typeof callback === 'function')
        callback(err, store);

      if (err) throw err;
      return store;
    }

    if (typeof config === 'string') {
      if (typeof require === 'function') {
        config = parse(require(config));
      } else if (JSON && XMLHttpRequest) {
        var oCallback = callback;
        callback = null;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', config, true);
        xhr.overrideMimeType('application/json');
        config = {};

        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4)
            return;

          var err = null;
          var s = xhr.status;

          if (!s && xhr.response || s >= 200 && s < 300 || s === 304) {
            try {
              config = parse(JSON.parse(xhr.responseText));
            } catch (e) {
              err = e;
              config = {};
            }
          } else {
            err = new Error('HTTP Error ' + xhr.status);
          }

          if (typeof oCallback === 'function') {
            oCallback(err, store);
          }
        };

        try {
          xhr.send(null);
        } catch (e) {
          xhr.abort();
          return done(e, store);
        }
      }
    } else {
      config = parse(config);
    }

    function store (param, defaultValue) {
      param = normalise(param);

      if (param in argv)
        return argv[param];

      if (param in config)
        return config[param];

      if (param in env)
        return env[param];

      if (arguments.length > 1) {
        if (typeof defaultValue === 'function')
          return defaultValue(param);
        else
          return defaultValue;
      }

      throw new ReferenceError('Unable to find ' + param + ' configuration');
    }

    return done(null, store);
  }

  configStore.noConflict = function () {
    root.configStore = previousStore;
    return configStore;
  };

  // AMD / RequireJS
  if (typeof define !== 'undefined' && define.amd) {
    define([], function () {
      return configStore;
    });
  }
  // Node.js
  else if (typeof module !== 'undefined' && module.exports) {
    module.exports = configStore;
  }
  // included directly via <script> tag
  else {
    root.configStore = configStore;
  }

  function normalise (value) {
    return (''+value).replace(/([^A-Z_])([A-Z])/g, '$1_$2').toUpperCase();
  }

  function parse (config) {
    config = config || {};
    var parsed = {};

    Object.keys(config).forEach(function (key) {
      var normalised = normalise(key);

      if (Object.prototype.toString.call(config[key]) === '[object Object]') {
        var subconfig = parse(config[key]);
        //parsed[normalised] = config[key];
        Object.keys(subconfig).forEach(function(key) {
          parsed[normalised+'_'+key] = subconfig[key];
        });
      } else {
        parsed[normalised] = config[key];
      } 
    });

    Object.keys(parsed).forEach(function (key) {
      var match = key.match(/^([^_]+)_(.*)$/);
      if (match) {
        var keyStub = match[1];
        var rest = match[2];
        parsed[keyStub] = parsed[keyStub] || {};
        parsed[keyStub][rest] = parsed[key];
      }
    });

    return parsed;
  }

  function getArgv () {
    try {
      if (!process || !process.argv || (typeof require !== 'function')) {
        return {};
      }

      return parse(require('optimist').argv);
    } catch (e) {
      return {};
    }
  }

  function getEnv () {
    try {
      return parse((process || {}).env || {});
    } catch (e) {
      return {};
    }
  }

})();
