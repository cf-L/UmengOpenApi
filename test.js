'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('email', 'password')
  const result = await umeng.trend('appKey', '2018-08-31', '2018-08-31', Umeng.TRENDVIEW.AVGDURATION)
  console.log(result)
}

test()
