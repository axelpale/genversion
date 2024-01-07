/* global describe,it,afterEach,beforeEach */

// See https://www.npmjs.com/package/command-line-test
const CliTest = require('command-line-test')
const path = require('path')
const fs = require('fs-extra')
const should = require('should') // eslint-disable-line no-unused-vars
const pjson = require('../package')

// If global command is used, you must 'npm link' before tests.
// const COMMAND = 'genversion'; // Global
const GENERATE_COMMAND = 'node bin/genversion.js' // Local

// Known signature
const SIGNATURE = '// Generated by genversion.\n'
// Temporary place for the generated version module
const P = '.tmp/v.js'

const createTemp = (content) => {
  fs.outputFileSync(P, content)
}
const readTemp = () => {
  return fs.readFileSync(P).toString()
}
const removeTemp = () => {
  if (fs.existsSync(P)) {
    fs.unlinkSync(P)
    fs.rmdirSync(path.dirname(P))
  }
}

describe('genversion cli', () => {
  beforeEach(() => {
    removeTemp()
  })

  afterEach(() => {
    removeTemp()
  })

  it('should generate file and dir if they do not exist', (done) => {
    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND + ' ' + P, (err, response) => {
      if (err) {
        console.error(err, response)
        return
      }

      // Should not have any output
      response.stdout.should.equal('')
      response.stderr.should.equal('')

      fs.existsSync(P).should.equal(true)

      return done()
    })
  })

  it('should not generate if unknown file exists', (done) => {
    // Generate file with unknown signature
    const INVALID_SIGNATURE = 'foobarcontent'
    createTemp(INVALID_SIGNATURE)

    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND + ' ' + P, (err, response) => {
      if (err) {
        console.error(err, response)
        return
      }

      response.stderr.should.startWith('ERROR')

      // Ensure the file was not replaced
      readTemp().should.equal(INVALID_SIGNATURE)

      return done()
    })
  })

  it('should generate if file has lowercase signature', (done) => {
    createTemp('// generated by genversion')

    const clit = new CliTest()
    clit.exec(GENERATE_COMMAND + ' ' + P, (err, response) => {
      if (err) {
        console.error(err, response)
        return
      }

      readTemp().should.equal(SIGNATURE +
        'module.exports = \'' + pjson.version + '\'\n')

      return done()
    })
  })

  it('should detect missing target path', (done) => {
    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND, (err, response) => {
      if (err) {
        console.error(err, response)
        return
      }

      // NOTE: response.stderr is null because process exited with code 1
      response.error.code.should.equal(1)

      return done()
    })
  })

  describe('flags --es6 --semi --double --backtick --strict', () => {
    it('should allow --es6 flag', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --es6 ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        readTemp().should.equal(SIGNATURE +
          'export const version = \'' + pjson.version + '\'\n')

        return done()
      })
    })

    it('should allow --strict flag', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --strict ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        readTemp().should.equal(SIGNATURE +
          '\'use strict\'\n\n' +
          'module.exports = \'' + pjson.version + '\'\n')

        return done()
      })
    })

    it('should allow --double flag', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --double ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        readTemp().should.equal(SIGNATURE +
          'module.exports = "' + pjson.version + '"\n')

        return done()
      })
    })

    it('should allow --backtick flag', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --backtick ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        readTemp().should.equal(SIGNATURE +
          'module.exports = `' + pjson.version + '`\n')

        return done()
      })
    })

    it('should have --backtick flag take precedence over --double flag', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --backtick --double ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        readTemp().should.equal(SIGNATURE +
          'module.exports = `' + pjson.version + '`\n')

        return done()
      })
    })

    it('should allow --semi and --strict flag', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --semi --strict ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        readTemp().should.equal(SIGNATURE +
          '\'use strict\';\n\n' +
          'module.exports = \'' + pjson.version + '\';\n')

        return done()
      })
    })

    it('should allow --semi and --esm flag', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --semi --esm ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        readTemp().should.equal(SIGNATURE +
          'export const version = \'' + pjson.version + '\';\n')

        return done()
      })
    })

    it('should allow -ud flags', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' -ud ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        readTemp().should.equal(
          SIGNATURE +
          '"use strict"\n\n' +
          'module.exports = "' + pjson.version + '"\n'
        )

        return done()
      })
    })

    it('should allow -s and -e and -u flags', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' -s -e -u ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        readTemp().should.equal(SIGNATURE +
            '\'use strict\';\n\n' +
            'export const version = \'' + pjson.version + '\';\n')

        return done()
      })
    })
  })

  describe('flag --verbose', () => {
    it('should allow verbose flag', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' -v ' + P, (err, response) => {
        if (err) {
          console.error(err, response)
          return
        }

        response.stdout.should.containEql(pjson.version)

        return done()
      })
    })
  })

  describe('flag --source', () => {
    it('should allow source argument with filepath', (done) => {
      const clit = new CliTest()

      const cmd = GENERATE_COMMAND + ' --source ./test/fixture/package.json ' + P
      clit.exec(cmd, (err, resp) => {
        if (err) {
          console.error(err, resp)
          return
        }

        const wantedContent = SIGNATURE + 'module.exports = \'0.1.2\'\n'
        readTemp().should.equal(wantedContent)

        return done()
      })
    })

    it('should allow source argument with dirpath', (done) => {
      const clit = new CliTest()

      const cmd = GENERATE_COMMAND + ' --source ./test/fixture ' + P
      clit.exec(cmd, (err, resp) => {
        if (err) {
          console.error(err, resp)
          return
        }

        const wantedContent = SIGNATURE + 'module.exports = \'0.1.2\'\n'
        readTemp().should.equal(wantedContent)

        return done()
      })
    })
  })

  describe('flag --force', () => {
    it('should generate if unknown file exists', (done) => {
      // Generate file with unknown signature
      const INVALID_SIGNATURE = 'foobarcontent'
      createTemp(INVALID_SIGNATURE)

      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --force ' + P, (err, response) => {
        if (err) {
          return done(err)
        }

        // Should not have any output
        response.stdout.should.equal('')
        response.stderr.should.equal('')

        // Ensure the file exists and was replaced
        fs.existsSync(P).should.equal(true)
        readTemp().should.not.equal(INVALID_SIGNATURE)

        return done()
      })
    })
  })

  describe('flag --version', () => {
    it('should show genversion\'s own version', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --version', (err, response) => {
        if (err) {
          return done(err)
        }

        response.stdout.should.equal(pjson.version)

        return done()
      })
    })
  })

  describe('flag --check-only', () => {
    it('should detect matching file', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' ' + P, (err) => {
        if (err) {
          return done(err)
        }

        const FLAGS = ' --check-only '
        clit.exec(GENERATE_COMMAND + FLAGS + P, (errx, response) => {
          if (errx) {
            return done(errx)
          }

          // File exists and has correct syntax
          should.equal(response.error, null)
          // Should not have any output
          response.stdout.should.equal('')
          response.stderr.should.equal('')

          return done()
        })
      })
    })

    it('should detect missing file', done => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --check-only ' + P, (err, response) => {
        if (err) {
          return done(err)
        }

        response.error.code.should.equal(1)
        // Should not have any output.
        // Maybe not good way to test because CliTest nulls stdout anyway.
        should(response.stdout).equal(null)
        should(response.stderr).equal(null)

        return done()
      })
    })

    it('should detect a standard change', done => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' ' + P, (err) => {
        if (err) {
          return done(err)
        }

        const FLAGS = ' --es6 --check-only '
        clit.exec(GENERATE_COMMAND + FLAGS + P, (err, response) => {
          if (err) {
            return done(err)
          }

          // File exists but has incorrect syntax
          response.error.code.should.equal(2)
          return done()
        })
      })
    })

    // TODO cannot test verbosity with check-only due to annoying shortcoming
    // TODO in command-line-test, where stdout and stderr become nulls
    // TODO if exit code other than 0
    // it('should have verbose output', done => {
    //   const clit = new CliTest()
    //
    //   const FLAGS = ' --verbose --check-only '
    //   clit.exec(GENERATE_COMMAND + FLAGS + P, (err, response) => {
    //     if (err) {
    //       return done(err)
    //     }
    //
    //     // File exists but has incorrect syntax
    //     response.stdout.should.include('could not be found')
    //     return done()
    //   })
    // })
  })

  describe('flag --property', () => {
    it('should pick selected property', (done) => {
      const clit = new CliTest()

      clit.exec(GENERATE_COMMAND + ' --property name ' + P, (err, response) => {
        if (err) {
          return done(err)
        }

        readTemp().should.equal(SIGNATURE +
          'module.exports = \'' + pjson.name + '\'\n')

        return done()
      })
    })

    it('should pick multiple properties', (done) => {
      const clit = new CliTest()
      const cmd = GENERATE_COMMAND + ' --property name,version ' + P
      clit.exec(cmd, (err, response) => {
        if (err) {
          return done(err)
        }

        readTemp().should.equal(SIGNATURE +
          'exports.name = \'' + pjson.name + '\'\n' +
          'exports.version = \'' + pjson.version + '\'\n')

        return done()
      })
    })

    it('should not understand multiple property flags', (done) => {
      const clit = new CliTest()
      const cmd = GENERATE_COMMAND + ' --property name ' +
        '--property version --esm ' + P
      clit.exec(cmd, (err, response) => {
        if (err) {
          return done(err)
        }

        readTemp().should.equal(SIGNATURE +
          'export const version = \'' + pjson.version + '\'\n')

        return done()
      })
    })
  })

  describe('flag --template', () => {
    it('should use custom template', (done) => {
      const clit = new CliTest()
      const cmd = GENERATE_COMMAND +
        ' --template ./test/fixture/template.ejs ' + P

      clit.exec(cmd, (err, response) => {
        if (err) {
          return done(err)
        }

        readTemp().should.equal(
          'export default \'' + pjson.version + '\'\n')

        return done()
      })
    })

    it('should detect missing template', (done) => {
      const clit = new CliTest()
      const cmd = GENERATE_COMMAND +
        ' --template ./test/fixture/foo.ejs ' + P

      clit.exec(cmd, (err, response) => {
        if (err) {
          return done(err)
        }

        response.error.code.should.equal(1)
        // TODO command-line-test has a bug when error code not zero
        // TODO it then does not set stdout nor stderr
        // should(response.stderr).not.equal(null)
        // should(response.stderr).startWith('Missing')

        return done()
      })
    })
  })
})
