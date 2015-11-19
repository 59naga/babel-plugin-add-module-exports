babel-plugin-add-module-exports
---

<p align="right">
  <a href="https://npmjs.org/package/babel-plugin-add-module-exports">
    <img src="https://img.shields.io/npm/v/babel-plugin-add-module-exports.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/59naga/babel-plugin-add-module-exports">
    <img src="http://img.shields.io/travis/59naga/babel-plugin-add-module-exports.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/babel-plugin-add-module-exports/coverage">
    <img src="https://img.shields.io/codeclimate/github/59naga/babel-plugin-add-module-exports.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/babel-plugin-add-module-exports">
    <img src="https://img.shields.io/codeclimate/coverage/github/59naga/babel-plugin-add-module-exports.svg?style=flat-square">
  </a>
</p>

Installation
---

```bash
npm install babel-plugin-add-module-exports --save-dev
```

Why?
---

[babel-plugin-transform-es2015-modules-commonjs@6.1.4](https://www.npmjs.com/package/babel-plugin-transform-es2015-modules-commonjs) doesn't support the `module.exports`.

> [Kill CommonJS default export behaviour - babel/babel#2212](https://phabricator.babeljs.io/T2212)

```js
// index.js
export default 'foo'
```

```bash
npm install babel-cli --global
npm install babel-preset-es2015 --save-dev
npm install babel-plugin-transform-es2015-modules-commonjs@6.1.4 --save-dev

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

This plugin add the `module.exports` if **only** the `export default` declaration exists.

```bash
npm install babel-plugin-add-module-exports --save-dev
babel index.js --presets es2015 --plugins add-module-exports > bundle.js
# 'use strict';
#
# Object.defineProperty(exports, "__esModule", {
#   value: true
# });
# exports.default = 'foo';
# module.exports = exports['default'];
```

Therefore, `.default` is the unnecessary.

```js
require('./bundle.js') // foo
```

License
---
[MIT](http://59naga.mit-license.org/)
