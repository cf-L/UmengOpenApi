'use strict'

const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const moment = require('moment-timezone')

const filePath = path.join(__dirname, '../data/UmengRestrict.json')
const RESTRICTTIMES = 500
const RESTRICTINTERVAL = 1000 * 60 * 15

function delay(interval) {
  return new Promise((resole) => {
    setTimeout(resole, interval)
  })
}

const TZ = (date) => {
  if (date) {
    return moment(date).tz('Asia/Shanghai')
  }
  return moment().tz('Asia/Shanghai')
}

const getInfo = () => {
  const fileExists = fs.existsSync(filePath)

  if (!fileExists) {
    return {
      isLimit: false,
      times: 0,
      endDate: null,
      lastDate: null,
      resetDate: null
    }
  }

  const obj = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  if (obj.endDate) {
    obj.endDate = TZ(obj.endDate)
  }

  if (obj.lastDate) {
    obj.lastDate = TZ(obj.lastDate)
  }

  if (obj.times) {
    obj.times = parseInt(obj.times)
  }

  return obj
}

const setInfo = (obj) => {
  fse.ensureFileSync(filePath)
  fs.writeFileSync(filePath, JSON.stringify(obj))
}

const wait = async() => {
  let info = getInfo()
  let duration = 0

  if (info.isLimit) {
    duration = info.endDate ? info.endDate.valueOf() - TZ().valueOf() : RESTRICTINTERVAL
    info.times = 0 // reset request times
    info.resetDate = TZ().format()
  } else if (info.resetDate) {
    if (info.times >= RESTRICTTIMES) {
      let interval = TZ().valueOf() - TZ(info.resetDate).valueOf()

      if (interval > RESTRICTINTERVAL && info.lastDate) {
        interval = TZ().valueOf() - TZ(info.lastDate).valueOf()
      }

      if (interval <= RESTRICTINTERVAL) {
        duration = RESTRICTINTERVAL

        info.times = 0
        info.resetDate = TZ().format()
      }
    } else {
      info.times = info.times !== null ? info.times + 1 : 1
    }
  } else {
    info.resetDate = TZ().format()
  }

  info.lastDate = TZ().format()

  if (duration > 0) {
    info.isLimit = true
    setInfo(info)

    log(`wait ${duration}`)
    await delay(duration)
    info = getInfo()
    info.isLimit = false
    setInfo(info)
  } else {
    setInfo(info)
  }
}

module.exports = {
  wait
}
