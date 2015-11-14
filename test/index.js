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

const fixture = `
  let foo= 'bar'
  export default 'baz'
  export {foo}
`

function testPlugin (code, options, fn) {
  const result = babel.transform(code, options)
  const sandbox = createSandbox()

  vm.runInNewContext(result.code, sandbox)

  fn(sandbox.module.exports)
}

describe('babel-plugin-add-module-exports', () => {
  it('should not export default to `module.exports` by default.', () =>
    testPlugin(fixture, {
      presets: ['es2015']
    }, (module) => {
      assert(module.toString() !== 'baz')
      assert(module.default === 'baz')
      assert(module.foo === 'bar')
    }))

  it('should export default to `module.exports` with this plugin', () =>
    testPlugin(fixture, {
      presets: ['es2015'],
      plugins: ['../lib/index.js']
    }, (module) => {
      assert(module.toString() === 'baz') // need to invoke toString explicitly
      assert(module.default === 'baz')
      assert(module.foo === 'bar')
    }))

  it('should handle duplicated plugin references (#1)', () =>
    testPlugin(fixture, {
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
