// Dependencies
var babel= require('babel-core')
var assert= require('power-assert')

// Fixture
var fixture=`
let foo= 'bar'
export default 'baz'
export {foo}
`

// Specs
describe('babel-plugin-add-module-exports',function(){
  // wait for the babel-preset-es2015
  this.timeout(5000)
  before(()=>{
    babel.transform('',{
      presets: ['es2015'],
      plugins: ['transform-es2015-modules-commonjs'],
    })
  })

  it('Nope.',()=>{
    var result= babel.transform(fixture,{
      presets: ['es2015'],
      plugins: ['transform-es2015-modules-commonjs'],
    })

    var EOFExpression= result.ast.program.body.slice(-1)[0].expression
    assert(EOFExpression.left.object.name !== 'module')
    assert(EOFExpression.left.property.name !== 'exports')
  })

  it('Add the `module.exports = Object.assign(exports.default,exports);` to EOF.',()=>{
    var result= babel.transform(fixture,{
      presets: ['es2015'],
      plugins: ['../lib/index.js'],
    })

    var EOFExpression= result.ast.program.body.slice(-1)[0].expression
    assert(EOFExpression.left.object.name === 'module')
    assert(EOFExpression.left.property.name === 'exports')
    assert(EOFExpression.operator === '=')
    assert(EOFExpression.right.callee.object.name === 'Object')
    assert(EOFExpression.right.callee.property.name === 'assign')
  })

  it('issue#1',()=>{
    var result= babel.transform(fixture,{
      presets: ['es2015'],
      plugins: [
        '../lib/index.js',
        '../lib/index.js',
        '../lib/index.js',
      ],
    })

    var EOFExpression= result.ast.program.body.slice(-1)[0].expression
    assert(EOFExpression.left.object.name === 'module')
    assert(EOFExpression.left.property.name === 'exports')
    assert(EOFExpression.operator === '=')
    assert(EOFExpression.right.callee.object.name === 'Object')
    assert(EOFExpression.right.callee.property.name === 'assign')
  })
})
