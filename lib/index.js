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

          var hasExportDefault = false
          var hasExportNamed = false
          path.get('body').forEach(function (path) {
            if (path.isExportDefaultDeclaration()) {
              hasExportDefault = true
              return
            }
            if (path.isExportNamedDeclaration()) {
              hasExportNamed = true
              return
            }
          })

          if (hasExportDefault && !hasExportNamed) {
            var topNodes = []
            topNodes.push(babelTemplate("module.exports = exports['default']")())

            path.pushContainer('body', topNodes)
          }

          path.BABEL_PLUGIN_ADD_MODULE_EXPORTS = true
        }
      }
    }
  }
}
