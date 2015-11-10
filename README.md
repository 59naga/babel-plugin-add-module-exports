BabelPlugin `Add module.exports`  [![NPM version][npm-image]][npm] [![Build Status][travis-image]][travis] [![Coverage Status][cover-image]][cover] [![Climate Status][climate-image]][climate]
---

> Fix [Kill CommonJS default export behaviour - babel/babel#2212](https://github.com/babel/babel/issues/2212)

Installation
---

```bash
npm install babel-plugin-add-module-exports --save-dev
```

Why?
---

[babel-plugin-transform-es2015-modules-commonjs@6.1.3](https://www.npmjs.com/package/babel-plugin-transform-es2015-modules-commonjs) doesn't support the `module.exports`.

```js
// index.js
let foo= 'bar'
export default 'baz'
export {foo}
```

```bash
npm install babel-core@6.1.2 --global
npm install babel-preset-es2015 --save-dev
npm install babel-plugin-transform-es2015-modules-commonjs --save-dev

babel index.js --presets es2015 --plugins transform-es2015-modules-commonjs > bundle.js
# 'use strict';
#
# Object.defineProperty(exports, "__esModule", {
#   value: true
# });
# var foo = 'bar';
# exports.default = 'baz';
# exports.foo = foo;
```

Therefore, need to use the `.default` at NodeJS.

```js
require('./bundle.js') // { default: 'baz', foo: 'bar' }
require('./bundle.js').default // 'baz'
```

The `babel-plugin-add-module-exports` add the `module.exports` to EOF.

```bash
npm install babel-plugin-add-module-exports --save-dev
babel index.js --presets es2015 --plugins add-module-exports > bundle.js
# 'use strict';
#
# Object.defineProperty(exports, "__esModule", {
#   value: true
# });
# var foo = 'bar';
# exports.default = 'baz';
# exports.foo = foo;
# module.exports = Object.assign(exports.default, exports);
```

Therefore, `.default` is the unnecessary.

```js
require('./bundle.js') // { [String: 'baz'] default: 'baz', foo: 'bar' }
require('./bundle.js')+'' // baz
```

Can polyfill the `Object.assign`?
---

See also [babel-plugin-transform-object-assign](https://github.com/babel/babel/tree/development/packages/babel-plugin-transform-object-assign).

example:

```bash
npm install babel-plugin-transform-object-assign --save-dev
babel index.js --presets es2015 --plugins add-module-exports,transform-object-assign > bundle.js
# 'use strict';
#
# var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
#
# Object.defineProperty(exports, "__esModule", {
#   value: true
# });
# var foo = 'bar';
# exports.default = 'baz';
# exports.foo = foo;
# module.exports = _extends(exports.default, exports);
```

License
---
[MIT][License]

[License]: http://59naga.mit-license.org/

[sauce-image]: http://soysauce.berabou.me/u/59798/babel-plugin-add-module-exports.svg
[sauce]: https://saucelabs.com/u/59798
[npm-image]:https://img.shields.io/npm/v/babel-plugin-add-module-exports.svg?style=flat-square
[npm]: https://npmjs.org/package/babel-plugin-add-module-exports
[travis-image]: http://img.shields.io/travis/59naga/babel-plugin-add-module-exports.svg?style=flat-square
[travis]: https://travis-ci.org/59naga/babel-plugin-add-module-exports
[cover-image]: https://img.shields.io/codeclimate/github/59naga/babel-plugin-add-module-exports.svg?style=flat-square
[cover]: https://codeclimate.com/github/59naga/babel-plugin-add-module-exports/coverage
[climate-image]: https://img.shields.io/codeclimate/coverage/github/59naga/babel-plugin-add-module-exports.svg?style=flat-square
[climate]: https://codeclimate.com/github/59naga/babel-plugin-add-module-exports
