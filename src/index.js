// 1. find to ExportsModuleDeclaration(`Object.defineProperty(exports, "__esModule", {value: true});`)
// 2. find to ExportsAssignmentExpression(`exports.default`, `exports.foo` etc)
// 3. add `module.exports` if exists only `exports.default` assignment
// The above works after executing `preset-env`(transform-es2015-modules-*) in `Plugin.post`

module.exports = ({template, types}) => {
  let pluginOptions
  const ExportsModuleDeclarationVisitor = {
    CallExpression: {
      exit (path) {
        if (isExportsModuleDeclaration(path)) {
          const finder = new ExportFinder(path)

          if (finder.isOnlyDefaultExport()) {
            const rootPath = finder.getRootPath()

            // HACK: `path.node.body.push` instead of path.pushContainer(due doesn't work in Plugin.post)
            rootPath.node.body.push(template('module.exports = exports.default')())
            if (pluginOptions.addDefaultProperty) {
              rootPath.node.body.push(template('module.exports.default = exports.default')())
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
      fileMap.path.traverse(ExportsModuleDeclarationVisitor)
    }
  }
}

function isExportsModuleDeclaration (path) {
  // Not `Object.defineProperty`, skip
  if (!path.get('callee.object').node) {
    return false
  }

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
  getRootPath () {
    return this.path.parentPath.parentPath
  }
  isOnlyDefaultExport () {
    this.getRootPath().get('body').forEach((path) => {
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
