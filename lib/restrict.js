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

  if (info.isLimit && info.endDate) {
    const interval = info.endDate.valueOf() - TZ().valueOf()
    duration = interval > 0 ? interval : 0
    if (interval <= 0) {
      info.isLimit = false
      info.resetDate = TZ().format()
      info.times = 0
    }
  } else if (info.times >= RESTRICTTIMES && info.lastDate) {
    const interval = TZ().valueOf() - TZ(info.last).valueOf()

    if (interval <= RESTRICTINTERVAL) {
      duration = RESTRICTINTERVAL - interval
    } else {
      info.times = 0
    }
  }

  if (duration > 0) {
    info.isLimit = true
    info.endDate = TZ(TZ().valueOf() + duration).format()
    setInfo(info)
    console.log(`wait ${duration}`)
    await delay(duration)
    info = getInfo()
    info.times = 0
    info.isLimit = false
  } else {
    info.lastDate = TZ().format()
  }

  info.times += 1

  setInfo(info)
}

module.exports = {
  wait
}
