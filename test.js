'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('service@flowever.net', 'Team0123')
  const result = await umeng.trend('5aebb69c8f4a9d1240000070', '2018-08-31', '2018-08-31', Umeng.TRENDVIEW.AVGDURATION)
  console.log(result)
}

test()
