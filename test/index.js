import assert from 'assert'
import { transform as babelTransform } from 'babel-core'
import { transform as babelTransform7 } from '@babel/core'
import { testPlugin, equal } from './helpers'
import testCases from './spec'

const babelVersions = {
  'babel@6': babelTransform,
  'babel@7': babelTransform7
}

Object.keys(babelVersions).forEach(ver => {
  const transform = babelVersions[ver]
  const env = ver === 'babel@6' ? 'env' : '@babel/preset-env'

  describe('babel-plugin-add-module-exports ' + ver, () => {
    it('should not export default to `module.exports` by default.', () =>
      testPlugin(
        transform,
        testCases[0].code,
        {
          presets: [env]
        },
        module => {
          assert(module !== 'default-entry')
          assert(module.default === 'default-entry')
        }
      ))

    it('should not handle an pure esmodule', () => {
      const code = `export default 'default-entry';`
      const result = transform(code, {
        presets: [[env, { modules: false }]],
        plugins: ['./src/index.js']
      })

      // use code comparison instead of vm.runInNewContext(doesn't work `export` syntax)
      assert(code === result.code)
    })

    it('should not handle an amd module', () =>
      testPlugin(
        transform,
        `export default 'default-entry';`,
        {
          presets: [[env, { modules: 'amd' }]],
          plugins: ['./src/index.js']
        },
        module => {
          assert(module.default === 'default-entry')
        },
        true
      ))

    it('plugin should export to module.exports(#31)', () => {
      const plugin = require('../src')
      assert(typeof plugin === 'function')
    })

    if (ver === 'babel@6') {
      // babel 7 throws an error with duplicate plugins
      it('should handle duplicated plugin references (#1)', () =>
        testPlugin(
          transform,
          testCases[0].code,
          {
            presets: [env],
            plugins: ['./src/index.js', './src/index.js', './src/index.js']
          },
          (module, code) => {
            assert(module === 'default-entry')

            // @see https://github.com/59naga/babel-plugin-add-module-exports/issues/12#issuecomment-157023722
            assert(module.default === undefined)

            assert(
              code ===
                `"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.default = "default-entry";\nmodule.exports = exports.default;`
            )
          }
        ))

      // rewire hasn't been updated for babel 7
      // https://github.com/speedskater/babel-plugin-rewire/issues/209
      it('should export with `babel-plugin-rewire` (#19)', () =>
        testPlugin(
          transform,
          "export default { stuff: 'things' }",
          {
            presets: ['react', env],
            plugins: ['./src/index.js', 'rewire']
          },
          module => {
            assert(module.stuff === 'things')
          }
        ))
    }

    testCases.forEach(testCase =>
      it(`should ${testCase.name}`, () =>
        testPlugin(
          transform,
          testCase.code,
          {
            presets: [[env, testCase.env]],
            plugins: [
              ver === 'babel@6' // use export-from syntax
                ? 'transform-export-extensions'
                : '@babel/plugin-proposal-export-default-from',
              ['./src/index.js', testCase.options]
            ]
          },
          module => {
            // assert module root (module.exports) object
            equal(module, testCase.expected.module)

            // assert each common entry is exported without error
            Object.keys(testCase.expected.exports).forEach(key =>
              equal(module[key], testCase.expected.exports[key])
            )
          }
        ))
    )
  })
})
