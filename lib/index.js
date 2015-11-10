// Dependencies
var babelTemplate= require('babel-template')

// Public
module.exports= function(){
  return {
    visitor: {
      Program: {
        exit: function(path){
          var topNodes= []
          topNodes.push(babelTemplate('module.exports = exports.default;')())

          path.pushContainer('body',topNodes)
        },
      },
    },
  }
}
