// Dependencies
var babelTemplate = require('babel-template')
var babelTypes = require('babel-types')
var _ = require('lodash')

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
              // HACK detect export-from statements for default
              var name = _.get(path.get('declaration'), 'container.specifiers[0].exported.name')
              if (name === 'default') {
                hasExportDefault = true
              } else {
                hasExportNamed = true
              }

              // HACK detect and replace renamed default (experimental)
              var specifiers = _.get(path.get('declaration'), 'container.specifiers')
              if (specifiers && specifiers.length === 1 && specifiers[0].local.name === 'default') {
                var named = specifiers[0].exported.name
                var source = path.node.source.value

                var syntax = 'exports.' + named + ' = (function(obj) { return obj && obj.__esModule ? obj[\'default\'] : obj; })(require($0));'
                var node = babelTemplate(syntax)(babelTypes.stringLiteral(source))
                path.replaceWith(node)
              }
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
