// Dependencies
var babelTemplate= require('babel-template')

// Public
module.exports= function(){
  return {
    visitor: {
      Program: {
        exit: function(path){
          if(path.BABEL_PLUGIN_ADD_MODULE_EXPORTS){
            return
          }

          var topNodes= []

          var code= 'module.exports=Object.assign(exports.default||{},exports);'
          var node= babelTemplate(code)()
          topNodes.push(node)

          path.pushContainer('body',topNodes)
          path.BABEL_PLUGIN_ADD_MODULE_EXPORTS= true
        },
      },
    },
  }
}
