'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('email', 'password')
  const result = await umeng.retentionsDetail('appKey', '2018-07-30', '2018-08-30', Umeng.RETENTIONS.TYPE.NEW, Umeng.RETENTIONS.UNIT.DAILY, 1, 10, [])
  console.log(result)
}

test()
