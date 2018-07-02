import assert from 'assert'
import {transform as babelTransform} from 'babel-core'
import { testPlugin, equal } from './helpers'
import testCases from './spec'

describe('babel-plugin-add-module-exports', () => {
  it('should not export default to `module.exports` by default.', () =>
    testPlugin(testCases[0].code, {
      presets: ['env']
    }, (module) => {
      assert(module !== 'default-entry')
      assert(module.default === 'default-entry')
    }))

  it('should not handle an pure esmodule', () => {
    const code = `export default 'default-entry';`
    const result = babelTransform(code, {
      presets: [['env', {modules: false}]],
      plugins: [
        './src/index.js'
      ]
    })
    assert(code === result.code)
  })

  it('plugin should export to module.exports(#31)', () => {
    const plugin = require('../src')
    assert(typeof plugin === 'function')
  })

  it('should handle duplicated plugin references (#1)', () =>
    testPlugin(testCases[0].code, {
      presets: ['env'],
      plugins: [
        './src/index.js',
        './src/index.js',
        './src/index.js'
      ]
    }, (module, code) => {
      assert(module === 'default-entry')

      // @see https://github.com/59naga/babel-plugin-add-module-exports/issues/12#issuecomment-157023722
      assert(module.default === undefined)

      assert(code === `"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.default = "default-entry";\nmodule.exports = exports.default;`)
    }))

  it('should export with `babel-plugin-rewire` (#19)', () =>
    testPlugin("export default { stuff: 'things' }", {
      presets: ['react', 'env'],
      plugins: [
        './src/index.js',
        'rewire'
      ]
    }, (module) => {
      assert(module.stuff === 'things')
    }))

  testCases.forEach((testCase) =>
    it(`should ${testCase.name}`, () =>
      testPlugin(testCase.code, {
        presets: [['env', testCase.env]],
        plugins: [
          'transform-export-extensions', // use export-from syntax
          ['./src/index.js', testCase.options]
        ]
      }, (module) => {
        // assert module root (module.exports) object
        equal(module, testCase.expected.module)

        // assert each common entry is exported without error
        Object.keys(testCase.expected.exports).forEach((key) =>
          equal(module[key], testCase.expected.exports[key]))
      })))
})
