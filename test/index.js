var vm = require('vm')
var babel = require('babel-core')
var assert = require('power-assert')

function createSandbox () {
  const exports = {}
  const sandbox = {
    exports,
    module: { exports }
  }

  return sandbox
}

function testPlugin (options, fn) {
  const fixture = `
    let foo= 'bar'
    export default 'baz'
    export {foo}
  `

  const result = babel.transform(fixture, options)
  const sandbox = createSandbox()

  vm.runInNewContext(result.code, sandbox)

  fn(sandbox.module.exports)
}

describe('babel-plugin-add-module-exports', () => {
  it('Nope.', () =>
    testPlugin({
      presets: ['es2015']
    }, (module) => {
      assert(module.toString() !== 'baz')
      assert(module.default === 'baz')
      assert(module.foo === 'bar')
    }))

  it('Add the `module.exports = Object.assign(exports.default,exports);` to EOF.', () =>
    testPlugin({
      presets: ['es2015'],
      plugins: ['../lib/index.js']
    }, (module) => {
      assert(module.toString() === 'baz') // need to invoke toString explicitly
      assert(module.default === 'baz')
      assert(module.foo === 'bar')
    }))

  it('issue#1', () =>
    testPlugin({
      presets: ['es2015'],
      plugins: [
        '../lib/index.js',
        '../lib/index.js',
        '../lib/index.js'
      ]
    }, (module) => {
      assert(module.toString() === 'baz') // need to invoke toString explicitly
      assert(module.default === 'baz')
      assert(module.foo === 'bar')
    }))
})
