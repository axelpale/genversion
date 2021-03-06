/* global describe,it,afterEach,beforeEach */

const should = require('should') // eslint-disable-line no-unused-vars
const path = require('path')
const fs = require('fs-extra')
const gv = require('../index')
const pjson = require('../package')

const P = '.tmp/v.js'

const removeTemp = () => {
  if (fs.existsSync(P)) {
    fs.unlinkSync(P)
    fs.rmdirSync(path.dirname(P))
  }
}

describe('genversion api', () => {
  beforeEach(() => {
    removeTemp()
  })

  afterEach(() => {
    removeTemp()
  })

  it('should detect missing version file', (done) => {
    gv.check('version.js', (err, doesExist, isByGenversion) => {
      should.equal(err, null)
      doesExist.should.equal(false)
      isByGenversion.should.equal(false)

      return done()
    })
  })

  it('should recognise es6 flag', (done) => {
    gv.generate(P, { useEs6Syntax: true }, (err, version) => {
      should.equal(err, null)
      version.should.equal(pjson.version)

      fs.readFileSync(P).toString().should.equal('// generated by ' +
        'genversion\nexport const version = \'' + pjson.version + '\'\n')

      gv.generate(P, (err2) => {
        should.equal(err2, null)
        fs.readFileSync(P).toString().should.equal('// generated by ' +
          'genversion\nmodule.exports = \'' + pjson.version + '\'\n')

        return done()
      })
    })
  })

  it('should recognise source flag', (done) => {
    gv.generate(P, { source: './test/fixture' }, (err, v) => {
      should.equal(err, null)
      v.should.equal('0.1.2')

      fs.readFileSync(P).toString().should.equal('// generated by ' +
        'genversion\nmodule.exports = \'0.1.2\'\n')

      return done()
    })
  })
})
