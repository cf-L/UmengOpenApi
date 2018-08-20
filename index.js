'use strict'

const co = require('co')
const Umeng = require('./lib')

co(function * () {
  const umeng = new Umeng('service@flowever.net', 'Team0123')

  const result = yield umeng.activeUsers(
    '5923978f677baa4370001bdf',
    '2018-08-11',
    '2018-08-11',
    Umeng.UMENGPERIOD.HOURLY)
  console.log(result)
})
