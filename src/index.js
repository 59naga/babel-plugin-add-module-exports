module.exports = ({template, types}) => {
  let pluginOptions
  const visitor = {
    CallExpression: {
      exit (path) {
        // Not `Object.defineProperty`, skip
        if (!path.get('callee.object').node) {
          return
        }

        if (isExportsModuleDeclaration(path)) {
          const finder = new ExportFinder(path)

          if (finder.isOnlyDefaultExport()) {
            const root = finder.getRootNode()

            // HACK: `program.node.body.push` instead of pushContainer(due doesn't work in Plugin.post)
            root.node.body.push(template('module.exports = exports.default')())
            if (pluginOptions.addDefaultProperty) {
              root.node.body.push(template('module.exports.default = exports.default')())
            }
          }
        }
      }
    }
  }

  return {
    visitor: {
      Program (path, state) {
        // HACK: can't get plugin options in Plugin.post
        pluginOptions = state.opts
      }
    },
    post (fileMap) {
      fileMap.path.traverse(visitor)
    }
  }
}

function isExportsModuleDeclaration (path) {
  const callee = `${path.get('callee.object.name').node}.${path.get('callee.property.name').node}`
  const args = path.get('arguments').map(path => {
    if (path.isStringLiteral()) {
      return path.get('value').node
    }
    if (path.get('properties').length) {
      return `${path.get('properties.0.key.name').node}:${path.get('properties.0.value.value').node}`
    }
  }).join(' ')

  // TODO: support loose syntax `  exports.__esModule = true;`
  return `${callee}${args}` === 'Object.defineProperty __esModule value:true'
}

class ExportFinder {
  constructor (path) {
    this.path = path
    this.hasExportDefault = false
    this.hasExportNamed = false
  }
  getRootNode () {
    return this.path.parentPath.parentPath
  }
  isOnlyDefaultExport () {
    this.getRootNode().get('body').forEach((path) => {
      if (path.isVariableDeclaration()) {
        this.findExport(path.get('declarations.0'), 'init')
      } else {
        if (path.isExpressionStatement() && path.get('expression').isAssignmentExpression()) {
          this.findExport(path)
        }
      }
    })
    return this.hasExportDefault && !this.hasExportNamed
  }
  findExport (path, property = 'expression') {
    // Not `exports.anything`, skip
    if (!path.get(`${property}.left`).node || !path.get(`${property}.left.object`).node) {
      return
    }

    const objectName = path.get(`${property}.left.object.name`).node
    const propertyName = path.get(`${property}.left.property.name`).node
    if (objectName === 'exports') {
      if (propertyName === 'default') {
        this.hasExportDefault = true
      } else {
        this.hasExportNamed = true
      }
    }
    return null
  }
}
