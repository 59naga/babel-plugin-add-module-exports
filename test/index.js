var vm = require('vm')
var util = require('util')
var babel = require('babel-core')
var assert = require('power-assert')
var testCases = require('./spec')

function createSandbox () {
  const exports = {}
  const sandbox = {
    exports,
    module: { exports }
  }

  return sandbox
}

function testPlugin (code, options, fn) {
  const result = babel.transform(code, options)
  const sandbox = createSandbox()

  vm.runInNewContext(result.code, sandbox)

  fn(sandbox.module.exports)
}

function inspect (object) {
  const result = util.inspect(object)
  return result.replace('Object {', '{') // HACK the module.export inspect
}

function equal (actual, expected) {
  if (typeof expected === 'string') {
    assert(actual.toString() === expected)
  } else if (typeof expected === 'function') {
    assert(actual() === expected())
  } else {
    assert(inspect(actual) === inspect(expected))
  }
}

describe('babel-plugin-add-module-exports', () => {
  it('should not export default to `module.exports` by default.', () =>
    testPlugin(testCases[0].code, {
      presets: ['es2015']
    }, (module) => {
      assert(module !== 'default-entry')
      assert(module.default === 'default-entry')
    }))

  it('should handle duplicated plugin references (#1)', () =>
    testPlugin(testCases[0].code, {
      presets: ['es2015'],
      plugins: [
        '../lib/index.js',
        '../lib/index.js',
        '../lib/index.js'
      ]
    }, (module) => {
      assert(module === 'default-entry')
      assert(module.default === undefined)
    }))

  testCases.forEach(testCase =>
    it(`should ${testCase.name}`, () =>
      testPlugin(testCase.code, {
        presets: ['es2015'],
        plugins: ['../lib/index.js']
      }, (module) => {
        // assert module root (module.exports) object
        equal(module, testCase.expected.module)

        // assert each common entry is exported without error
        Object.keys(testCase.expected.exports).forEach(key =>
          equal(module[key], testCase.expected.exports[key]))
      })))
})
