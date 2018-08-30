'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('email', 'password')
  const result = await umeng.avgPage('appKey', '2018-08-29', '2018-08-29')
  console.log(result)
}

test()
