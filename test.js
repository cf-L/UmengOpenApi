'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('email', 'password')
  const result = await umeng.trend('appKey', 'fromDate', 'toDate', Umeng.TRENDVIEW.NEWUSERS)
  console.log(result)
}

test()
