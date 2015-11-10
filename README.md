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
export default 'foo'
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
# exports.default = 'foo';
```

Therefore, need to use the `.default` at NodeJS.

```js
require('./bundle.js') // { default: 'foo' }
require('./bundle.js').default // 'foo'
```

This plugin add the `module.exports` to EOF.

```bash
npm install babel-plugin-add-module-exports --save-dev
babel index.js --presets es2015 --plugins babel-plugin-add-module-exports > bundle.js
# 'use strict';
#
# Object.defineProperty(exports, "__esModule", {
#   value: true
# });
# exports.default = 'foo';
# module.exports = exports.default;
```

Therefore, `.default` is the unnecessary.

```js
require('./bundle.js') // 'foo'
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
