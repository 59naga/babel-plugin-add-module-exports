import assert from 'assert'
import * as heplers from './helpers'
import testCases from './spec'

describe('babel-plugin-add-module-exports', () => {
  it('should not export default to `module.exports` by default.', () =>
    heplers.testPlugin(testCases[0].code, {
      presets: ['es2015']
    }, (module) => {
      assert(module !== 'default-entry')
      assert(module.default === 'default-entry')
    }))

  it('should handle duplicated plugin references (#1)', () =>
    heplers.testPlugin(testCases[0].code, {
      presets: ['es2015'],
      plugins: [
        './lib/index.js',
        './lib/index.js',
        './lib/index.js'
      ]
    }, (module) => {
      assert(module === 'default-entry')

      // @see https://github.com/59naga/babel-plugin-add-module-exports/issues/12#issuecomment-157023722
      assert(module.default === undefined)
    }))

  testCases.forEach((testCase) =>
    it(`should ${testCase.name}`, () =>
      heplers.testPlugin(testCase.code, {
        presets: ['es2015'],
        plugins: [
          'transform-export-extensions', // use export-from syntax
          './lib/index.js'
        ]
      }, (module) => {
        // assert module root (module.exports) object
        heplers.equal(module, testCase.expected.module)

        if (typeof testCase.expected.exports !== 'object') {
          return // avoid "Object.keys called on non-object" in node-v0
        }

        // assert each common entry is exported without error
        Object.keys(testCase.expected.exports).forEach((key) =>
          heplers.equal(module[key], testCase.expected.exports[key]))
      })))
})
