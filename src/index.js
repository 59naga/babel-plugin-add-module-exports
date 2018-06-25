class AssignmentReminder {
  constructor () {
    this.hasExportDefault = false
    this.hasExportNamed = false
  }
  evaluateExpression (path, property = 'expression') {
    // Not `exports.anything`, skip
    if (!path.get(`${property}.left`).node || !path.get(`${property}.left.object`).node) {
      return
    }

    const objectName = path.get(`${property}.left.object.name`).node
    const propertyName = path.get(`${property}.left.property.name`).node
    const name = `${objectName}.${propertyName}`
    if (name === 'exports.default') {
      this.hasExportDefault = true
    } else if (objectName === 'exports') {
      this.hasExportNamed = true
    }
  }
}

module.exports = ({types}) => ({
  visitor: {
    CallExpression: {
      exit (path, state) {
        // Not `Object.defineProperty`, skip
        if (!path.get('callee.object').node) {
          return
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

        const isLegacyModule = `${callee}${args}` === 'Object.defineProperty __esModule value:true'
        if (isLegacyModule) {
          const reminder = new AssignmentReminder()
          const program = path.parentPath.parentPath
          program.get('body').forEach((path) => {
            if (path.isVariableDeclaration()) {
              reminder.evaluateExpression(path.get('declarations.0'), 'init')
            } else {
              if (path.isExpressionStatement() && path.get('expression').isAssignmentExpression()) {
                reminder.evaluateExpression(path)
              }
            }
          })

          if (reminder.hasExportDefault && !reminder.hasExportNamed) {
            program.pushContainer('body', [
              types.expressionStatement(types.assignmentExpression(
                '=',
                types.memberExpression(types.identifier('module'), types.identifier('exports')),
                types.memberExpression(types.identifier('exports'), types.stringLiteral('default'), true)
              ))
            ])
          }
          if (state.opts.addDefaultProperty) {
            program.pushContainer('body', [
              types.expressionStatement(types.assignmentExpression(
                '=',
                types.memberExpression(types.memberExpression(types.identifier('module'), types.identifier('exports')), types.identifier('default')),
                types.memberExpression(types.identifier('exports'), types.stringLiteral('default'), true)
              ))
            ])
          }
        }
      }
    }
  }
})
