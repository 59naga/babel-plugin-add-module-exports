// Dependencies
var babel= require('babel-core')
var assert= require('power-assert')

// Fixture
var str=`export default 'foo'`
var out=`'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = 'foo';
module.exports = exports.default;`

// Specs
describe('babel-plugin-module-exports',()=>{
  it('Nope.',()=>{
    var result= babel.transform(str,{
      presets: ['es2015'],
      plugins: ['transform-es2015-modules-commonjs'],
    })
    assert(result.code.match('module.exports') === null)
    assert(result.code !== out)
  })

  it('Add the `module.exports = exports.default;` to EOF.',()=>{
    var result= babel.transform(str,{
      presets: ['es2015'],
      plugins: ['../lib/index.js'],
    })
    assert(result.code.match('module.exports') !== null)
    assert(result.code === out)
  })
})
