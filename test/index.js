/* eslint eqeqeq: 1 */

// Dependencies
var babel = require('babel-core')
var assert = require('power-assert')
var fsExtra = require('fs-extra')
var rimraf = require('rimraf')

// Fixture
var fixture = `
let foo= 'bar'
export default 'baz'
export {foo}
`
var fixturePath = 'node_modules/fixture'

// Specs
describe('babel-plugin-add-module-exports', function () {
  this.timeout(5000) // wait for load the `babel-preset-es2015`

  beforeEach(() => {
    try {
      rimraf.sync(fixturePath)
      delete require.cache[require.resolve('fixture')]
    } catch (e) {

    }
  })

  it('Nope.', () => {
    var result = babel.transform(fixture, {
      presets: ['es2015'],
      plugins: ['transform-es2015-modules-commonjs']
    })
    fsExtra.outputFileSync(fixturePath + '/index.js', result.code)

    var object = require('fixture')
    assert(object.default === 'baz')
    assert(object.foo === 'bar')
  })

  it('Add the `module.exports = Object.assign(exports.default,exports);` to EOF.', () => {
    var result = babel.transform(fixture, {
      presets: ['es2015'],
      plugins: ['../lib/index.js']
    })
    fsExtra.outputFileSync(fixturePath + '/index.js', result.code)

    var object = require('fixture')
    assert(object == 'baz')// not '==='
    assert(object.default === 'baz')
    assert(object.foo === 'bar')
  })

  it('issue#1', () => {
    var result = babel.transform(fixture, {
      presets: ['es2015'],
      plugins: [
        '../lib/index.js',
        '../lib/index.js',
        '../lib/index.js'
      ]
    })
    fsExtra.outputFileSync(fixturePath + '/index.js', result.code)

    var object = require('fixture')
    assert(object == 'baz')// not '==='
    assert(object.default === 'baz')
    assert(object.foo === 'bar')
  })
})
