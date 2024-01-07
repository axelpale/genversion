// Command-line test module
//
// Much inspired by https://github.com/xudafeng/command-line-test (MIT, 2017)
//

const childProcess = require('child_process')

function CliTest (options) {
  this.options = options || {}
  this.reset()
}

CliTest.prototype.get = function () {
  return {
    error: this.error,
    stdout: this.stdout,
    stderr: this.stderr
  }
}

CliTest.prototype.reset = function () {
  this.error = null
  this.stdout = null
  this.stderr = null
}

CliTest.prototype.exec = function () {
  const args = Array.prototype.slice.call(arguments)
  const command = args.shift()
  let options = {}
  let callback = null

  if (args.length === 2) {
    options = args.shift()
    callback = args.shift()
  } else if (args.length === 1) {
    if (typeof args[0] === 'function') {
      callback = args[0]
    } else {
      options = args[0]
    }
  }

  const promise = new Promise(resolve => {
    childProcess.exec(command, Object.assign({
      maxBuffer: 1024 * 512 * 10,
      wrapArgs: false
    }, options), (error, stdout, stderr) => {
      if (error) {
        this.error = error
        return resolve(this.get())
      }
      this.stderr = stderr.trim()
      this.stdout = stdout.trim()
      resolve(this.get())
    })
  })

  if (callback) {
    promise.then(data => {
      callback.call(this, null, data)
    }).catch(err => {
      callback.call(this, `exec ${command} error with: ${err}`)
    })
  } else {
    return promise
  }
}

module.exports = CliTest
