/* jshint -W069 */ // Ignore 'dot notation' errors

(function () {

  var root = this,
      previousStore,
      argv = getArgv(),
      env = getEnv(),
      compiled;

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

    store.find = function (param, defaultValue) {
      if (typeof compiled === 'undefined') {
        compiled = compile(argv, config, env);
        console.log(compiled);
      }

      var parts = normalise(param).toLowerCase().split('_').reverse(),
          data = compiled,
          part;

      while (parts.length) {
        part = parts.pop();

        if (typeof data[part] === 'undefined')
          return defaultValue;

        if (!parts.length)
          return data[part];

        data = data[part];
      }

      return data || defaultValue;
    };

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
    return (''+value).replace(/[^a-z_]+/i, '_').replace(/([^A-Z_])([A-Z])/g, '$1_$2').toUpperCase();
  }

  function parse (config) {
    config = config || {};
    var parsed = {};

    Object.keys(config).forEach(function (key) {
      var normalised = normalise(key);

      if (Object.prototype.toString.call(config[key]) === '[object Object]') {
        var subconfig = parse(config[key]);
        Object.keys(subconfig).forEach(function(key) {
          parsed[normalised+'_'+key] = subconfig[key];
        });
      } else {
        parsed[normalised] = config[key];
      } 
    });

    return parsed;
  }

  function compile () {
    var configs = Array.prototype.slice.call(arguments);

    return configs.reduce(function(compiled, config) {
      return Object.keys(config).reduce(function(compiled, key) {
        if (key.charAt(0) === '_') return compiled;

        var parts = key.toLowerCase().split(/_+/),
            last = parts.length - 1,
            obj = compiled;

        parts.forEach(function(part, index) {
          var type = Object.prototype.toString.call(obj[part]);
          if (!type.match(/^\[object (Undefined|Object|Array)\]$/))
            return;

          if (index === last) {
            if (!obj.hasOwnProperty(part))
              obj[part] = config[key];
          } else {
            if (!obj.hasOwnProperty(part))
              obj[part] = {};
            obj = obj[part];
          }
        });

        return compiled;
      }, compiled);
    }, {});
  }

  function getArgv () {
    try {
      if (!process || !process.argv || (typeof require !== 'function')) {
        return {};
      }

      var argv = require('optimist').argv;
      delete argv['_'];
      delete argv['$0'];
      return parse(argv);
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
