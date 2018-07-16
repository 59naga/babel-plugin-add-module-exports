// 1. find to `exports.default`
// 2. find to all Expression(`exports.default`, `exports.foo` etc)
// 3. add `module.exports` if exists only `exports.default` assignment
// The above works after executing `preset-env`(transform-es2015-modules-*) in `Plugin.post`

module.exports = ({ template }) => {
  let pluginOptions
  const ExportsDefaultVisitor = {
    AssignmentExpression(path) {
      if (path.get('left').matchesPattern('exports.default')) {
        const finder = new ExportsFinder(path)
        if (!finder.isOnlyExportsDefault()) {
          return
        }
        if (finder.isAmd()) {
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
      Program(path, state) {
        // HACK: can't get plugin options in Plugin.post
        pluginOptions = state.opts
      }
    },
    post(fileMap) {
      fileMap.path.traverse(ExportsDefaultVisitor)
    }
  }
}

class ExportsFinder {
  constructor(exportsDefaultPath) {
    this.path = exportsDefaultPath
    this.hasExportsDefault = false
    this.hasExportsNamed = false
    this.hasModuleExports = false
  }

  getRootPath() {
    return this.path.parentPath.parentPath
  }

  isOnlyExportsDefault() {
    this.getRootPath()
      .get('body')
      .forEach(path => {
        if (path.isVariableDeclaration()) {
          this.findExport(path.get('declarations.0'), 'init')
        } else if (
          path.isExpressionStatement() &&
          path.get('expression').isAssignmentExpression()
        ) {
          this.findExport(path)
        }
      })
    return this.hasExportsDefault && !this.hasExportsNamed && !this.hasModuleExports
  }

  findExport(path, property = 'expression') {
    // Not `exports.anything`, skip
    if (!path.get(`${property}.left`).node || !path.get(`${property}.left.object`).node) {
      return
    }

    const objectName = path.get(`${property}.left.object.name`).node
    const propertyName = path.get(`${property}.left.property.name`).node
    if (objectName === 'exports') {
      if (propertyName === 'default') {
        this.hasExportsDefault = true
      } else if (propertyName !== '__esModule') {
        this.hasExportsNamed = true
      }
    }
    if (`${objectName}.${propertyName}` === 'module.exports') {
      this.hasModuleExports = true
    }
  }

  isAmd() {
    const rootPath = this.getRootPath()
    const hasntAmdRoot = !(rootPath.parentPath && rootPath.parentPath.parentPath)
    if (hasntAmdRoot) {
      return false
    }

    const amdRoot = rootPath.parentPath.parentPath
    if (!amdRoot.isCallExpression()) {
      return false
    }
    if (amdRoot.get('callee.name').node === 'define') {
      return true
    }
    return false
  }
}
