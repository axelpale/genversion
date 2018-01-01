var findPackage = require('find-package')
var path = require('path')
var find = require('find')
var findInFiles = require('find-in-files')

var countSemiFiles = function (dirPath, excludePath, callback) {
  // Find the number of js files.
  // If there is more files with trailing semicolons than no semis
  // then we use semis.
  //
  find.file(/\.js$/, dirPath, function (files) {
    //
    // Do not count in the possibly existing version file.
    files = files.filter(function (fp) {
      return fp !== excludePath
    })

    findInFiles.find(';\n', dirPath, /\.js$/).then(function (results) {
      var num, key, numSemi

      num = files.length
      numSemi = 0

      for (key in results) {
        if (results.hasOwnProperty(key)) {
          if (key !== excludePath) {
            numSemi += 1
          }
        }
      }

      return callback(null, {
        numFiles: num,
        numFilesWithSemis: numSemi
      })

      // var mostSemi = false
      //
      // if (num === 0) {
      //   mostSemi = false // arbitrary
      // } else {
      //   if (numSemi >= Math.ceil(num / 2)) {
      //     mostSemi = true
      //   } else {
      //     mostSemi = false
      //   }
      // }
      //
      // console.log('mostSemi', mostSemi)
      //
      // return callback(null, mostSemi)
    })
  })
}

module.exports = function (targetPath, callback) {
  // Detect if the project uses semicolons or not.
  //
  // Parameters
  //   targetPath
  //     string. Absolute path to initial location to begin search.
  //   callback
  //     function (err, useSemicolon)
  //       Parameters
  //         err
  //         useSemicolon
  //           bool. True if semicolon is used
  //
  var pjson = findPackage(targetPath, true)  // true adds .paths property

  // If project uses standardjs, no semicolon.
  if (pjson.dependencies) {
    if (pjson.dependencies.hasOwnProperty('standard')) {
      return callback(null, false)
    }
  }

  var dirPath = path.dirname(targetPath)

  // TODO If there is no files, try bin/, lib/, src/

  // Find the number of js files.
  // If there is more files with trailing semicolons than no semis
  // then we use semis.
  countSemiFiles(dirPath, targetPath, function (errs, results) {
    if (errs) {
      return callback(errs)
    }

    var num = results.numFiles
    var numSemi = results.numFilesWithSemis
    var mostSemi

    if (num === 0) {
      mostSemi = false // arbitrary
    } else {
      if (numSemi >= Math.ceil(num / 2)) {
        mostSemi = true
      } else {
        mostSemi = false
      }
    }

    return callback(null, mostSemi)
  })
}
