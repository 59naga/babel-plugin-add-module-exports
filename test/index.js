// Dependencies
var babel= require('babel-core')
var assert= require('power-assert')

// Fixture
var str=`let foo= 'bar'
export default 'baz'
export {foo}`
var out=`'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var foo = 'bar';
exports.default = 'baz';
exports.foo = foo;
module.exports = Object.assign(exports.default, exports);`

// Specs
describe('babel-plugin-module-exports',function(){
  // wait for the babel-preset-es2015
  this.timeout(5000)
  before(()=>{
    babel.transform('',{
      presets: ['es2015'],
      plugins: ['transform-es2015-modules-commonjs'],
    })
  })

  it('Nope.',()=>{
    var result= babel.transform(str,{
      presets: ['es2015'],
      plugins: ['transform-es2015-modules-commonjs'],
    })
    assert(result.code.match('module.exports') === null)
    assert(result.code !== out)
  })

  it('Add the `module.exports = Object.assign(exports.default,exports);` to EOF.',()=>{
    var result= babel.transform(str,{
      presets: ['es2015'],
      plugins: ['../lib/index.js'],
    })
    assert(result.code.match('module.exports') !== null)
    assert(result.code === out)
  })
})
