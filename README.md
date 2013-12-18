# Config Store

A JavaScript config store.

The source is available for download from
[GitHub](http://github.com/andrewhayward/js-config-store).
Alternatively, you can install using Node Package Manager (npm):

    npm install config-store

## On the Server

On the server, it will read from three different locations (in order of priority):

 * command line arguments
 * a JSON configuration object (which may be read from a file)
 * environment variables

### Usage:

```javascript
var configStore = require('config-store');
var config = configStore({...});
// or      = configStore('./config.json');

var port = config('PORT', 3000);
var host = config('HOST');
```

Alternatively:

```javascript
var configStore = require('config-store');
configStore({...}, function (err, config) {
  var port = config('PORT', 3000);
  var host = config('HOST');
});
```


## In the Browser

In the browser, it will read from a JSON configuration object (which may be read from a file). So far it's not been tested - feel free to do so!

### Usage:

```html
<script src="configStore.js"></script>

<script>
  (function () {
    var config = configStore({...});

    var port = config('PORT', 3000);
    var host = config('HOST');
  })();
</script>

<script>
  (function () {
    configStore('/config.json', function (err, config) {
      var port = config('PORT', 3000);
      var host = config('HOST');
    });
  })();
</script>
```

## `find`

Sometimes, you might want to pull in entire sets of data from config...

```javascript
{
  "db": {
    "host": "...",
    "user": "...",
    "password": "..."
  }
}
```

The standard `config` lookup doesn't handle this, as it maps this type of structure to `env`-style variables, so `config('db')` would not return anything.

However, `config.find` is available for this type of situation, and lets you pull blocks of config out of the store. Unlike the standard lookup, it won't throw an error if the key is not found and you don't provide a fallback - the return value will just be `undefined`.

```javascript
var db = config.find('db');
// {host: "...", user: "...", password: "..."}
var user = config.find('db.user');
// "..."
var port = config.find('db.port');
// undefined
var port = config.find('db.port', 80);
// 80
```
