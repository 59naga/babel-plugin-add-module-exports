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
          topNodes.push(babelTemplate('module.exports=Object.assign(exports.default,exports);')())

          path.pushContainer('body',topNodes)
          path.BABEL_PLUGIN_ADD_MODULE_EXPORTS= true
        },
      },
    },
  }
}
