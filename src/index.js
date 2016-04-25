import babelTemplate from 'babel-template'
import _get from 'lodash.get'

export default {
  visitor: {
    Program: {
      exit (path) {
        if (path.BABEL_PLUGIN_ADD_MODULE_EXPORTS) {
          return
        }

        let hasExportDefault = false
        let hasExportNamed = false
        path.get('body').forEach((path) => {
          if (path.isExportDefaultDeclaration()) {
            hasExportDefault = true
            return
          }
          if (path.isExportNamedDeclaration()) {
            // HACK detect export-from statements for default
            const specifiers = _get(path.get('declaration'), 'container.specifiers')
            const isDefaultExportDeclaration = specifiers.length === 1 && specifiers[0].exported.name === 'default'
            if (isDefaultExportDeclaration) {
              hasExportDefault = true
            } else {
              hasExportNamed = true
            }
            return
          }
        })

        if (hasExportDefault && !hasExportNamed) {
          const topNodes = []
          topNodes.push(babelTemplate("module.exports = exports['default']")())

          path.pushContainer('body', topNodes)
        }

        path.BABEL_PLUGIN_ADD_MODULE_EXPORTS = true
      }
    }
  }
}
