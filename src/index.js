// 1. find to `exports.default`
// 2. find to all Expression(`exports.default`, `exports.foo` etc)
// 3. add `module.exports` if exists only `exports.default` assignment
// The above works after executing `preset-env`(transform-es2015-modules-*) in `Plugin.post`

module.exports = ({template, types}) => {
  let pluginOptions
  const ExportsDefaultVisitor = {
    AssignmentExpression (path) {
      const name = `${path.get('left.object.name').node}.${path.get(`left.property.name`).node}`
      if (name === 'exports.default') {
        const finder = new ExportFinder(path)
        if (!finder.isOnlyDefaultExport()) {
          return
        }
        const rootPath = finder.getRootPath()

        // HACK: `path.node.body.push` instead of path.pushContainer(due doesn't work in Plugin.post)
        rootPath.node.body.push(template('module.exports = exports.default')())
        if (pluginOptions.addDefaultProperty) {
          rootPath.node.body.push(template('module.exports.default = exports.default')())
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
      fileMap.path.traverse(ExportsDefaultVisitor)
    }
  }
}

class ExportFinder {
  constructor (path) {
    this.path = path
    this.hasExportsDefault = false
    this.hasExportsNamed = false
    this.hasModuleExports = false
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
    return this.hasExportsDefault && !this.hasExportsNamed && !this.hasModuleExports
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
        this.hasExportsDefault = true
      } else {
        this.hasExportsNamed = true
      }
    }
    if (`${objectName}.${propertyName}` === 'module.exports') {
      this.hasModuleExports = true
    }
    return null
  }
}
