'use strict'

const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const superagent = require('superagent')
const moment = require('moment-timezone')
const urlencode = require('urlencode')

const filePath = path.join(__dirname, '../data/Cookie.json')

class Cookie {
  static get TOKENKEY() {
    return 'umplus_uc_token'
  }

  async get(email, password) {
    let obj = this._readFileObject()

    if (obj[email] && obj[email]['token']) {
      if (this._cookieExpired(obj[email])) {
        await this._reflushCookie(email, password)
        obj = this._readFileObject()
      }

      return obj[email]['token']
    } else {
      await this._reflushCookie(email, password)
      obj = this._readFileObject()
      return obj[email] ? `${Cookie.TOKENKEY}=${obj[email]['token']}` : null
    }
  }

  async _stKey(email, password) {
    if (!email || !password) {
      throw Error('User email and password are required')
    }

    try {
      const link = 'https://passport.alibaba.com/newlogin/login.do'
      const obj = {
        loginId: email,
        password: password,
        appName: 'youmeng',
        appEntrance: 'default'
      }

      const res = await superagent.post(link)
        .type('form')
        .send(obj)
        .timeout(1000 * 30)
      const json = JSON.parse(res.text)

      if (json.hasError !== undefined && json.hasError === false && json.content && json.content.data) {
        return json.content.data.st
      } else {
        return null
      }
    } catch (error) {
      throw error
    }
  }

  _cookieExpired(obj) {
    if (obj.Expires) {
      const expires = TZ(obj.Expires)
      const today = TZ()
      return today.isAfter(expires)
    }
    return true
  }

  async _reflushCookie(email, password) {
    if (!email || !password) {
      throw Error('User email and password are required')
    }

    try {
      const st = await this._stKey(email, password)
      const link = `https://passport.umeng.com/login/register?st=${st}`
      await superagent.get(link).redirects(0)
    } catch (error) {
      if (error.response.status === 302) {
        const res = error.response

        const cookie = res.headers['set-cookie']

        if (cookie) {
          const cookieJSON = this._parseCookie(cookie)
          const tokenObj = cookieJSON[Cookie.TOKENKEY] || {}

          const obj = this._readFileObject()

          obj[email] = {
            token: tokenObj.value || '',
            Expires: tokenObj.Expires || ''
          }

          this._updateFile(obj)
        }
      } else {
        throw error
      }
    }
  }

  _parseCookie(cookie) {
    const json = {}

    for (const part of cookie) {
      const components = part.split('; ').filter(x => x.trim() !== '')

      if (components.length === 0) {
        continue
      }

      let lastKey = null

      for (let i = 0; i < components.length; i++) {
        const cp = components[i]
        const slice = cp.split('=')

        if (slice.length !== 2) {
          continue
        }

        if (i === 0) {
          lastKey = slice[0]
          json[lastKey] = { value: urlencode.decode(slice[1]) }
        } else if (lastKey) {
          let value = urlencode.decode(slice[1])
          if (slice[0] === 'Expires') {
            value = moment(new Date(value))
          }
          json[lastKey][slice[0]] = value
        }
      }
    }

    return json
  }

  _readFileObject() {
    const fileExists = fs.existsSync(filePath)
    if (!fileExists) {
      return {}
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }

  _updateFile(obj) {
    fse.ensureFileSync(filePath)
    fs.writeFileSync(filePath, JSON.stringify(obj))
  }
}

const TZ = (date) => {
  if (date) {
    return moment(date).tz('Asia/Shanghai')
  }
  return moment().tz('Asia/Shanghai')
}

module.exports = Cookie
