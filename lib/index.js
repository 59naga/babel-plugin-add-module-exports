// Dependencies
var babelTemplate = require('babel-template')

// Public
module.exports = function () {
  return {
    visitor: {
      Program: {
        exit: function (path) {
          if (path.BABEL_PLUGIN_ADD_MODULE_EXPORTS) {
            return
          }

          var code = `
            module.exports = (function () {
              const keys = Object.keys(exports)
              return keys.length === 1 && keys[0] === 'default'
                ? Object.assign(exports.default, { default: exports.default })
                : exports
            }())
          `

          var node = babelTemplate(code)()

          path.pushContainer('body', [node])
          path.BABEL_PLUGIN_ADD_MODULE_EXPORTS = true
        }
      }
    }
  }
}
