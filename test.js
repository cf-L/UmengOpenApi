'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('email', 'password')
  for (let i = 0; i < 20; i++) {
    const result = await umeng.newUsers('appkey', '2018-08-22', '2018-08-27')
    console.log('result: ', JSON.stringify(result))
  }
}

test()
