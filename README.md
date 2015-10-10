# SCols

SCols stands for scrolling/sticky columns; take your pick. Basically all it does
is implement a fairly simply behaviour to make multiple columns in a single
container always remain visible.

It weighs in at **5.1kb** minified (**1.6kb** gzipped).


## Usage

```bash
$ npm install --save scols
```

Then you can use it in your project like so:

```html
<div class="container" data-scols>
  <div class="column column--short" data-scols-col></div>
  <div class="column column--tall" data-scols-col></div>
</div>
```

```js
var SCols = require('scols');

var container = document.querySelector('[data-scols]');
var scols = new SCols(container);
```


### Stand-alone build

If you prefer a stand-alone library you can include in your pages, you can use
the provided build step (uses [browserify](http://browserify.org/)): `npm run
build`. This will output a few different flavours of scols.js in the `dist`
directory.

- `scols.js` - has merely been packaged by browserify to be suitable for browser
  consumption
- `scols.min.js` - has also been run through uglifyjs
- `scols.min.js.gz` - has also been run through gzip

You can use `scols.min.js` if your server already takes care of gzipping.


### API

#### `scols = new SCols(element[, options])`

Create a new instance of SCols.

- `element` - The container element
- `options` - Possible options, listed below

#### `scols.attach()`

Attach scols to the element provided to the constructor

#### `scols.detach()`

Detach the instance of scols from the dom


### Options

- `colSelector` (`[data-scols-col]`) - Selector to find columns
- `fromTop` (`0`) - Minimum offset from top of the viewport to maintain


### Events

SCols utilises [microevent](https://github.com/jeromeetienne/microevent.js) so
you can use `.bind` to register for the events below:

#### `position`

Emitted whenever column positioning has been done


## License

MIT © [Chiel Kunkels](http://kunkels.me/)
