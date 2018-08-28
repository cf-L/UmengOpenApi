'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('email', 'password')
  const result = await umeng.v3.app.detail.newUser('appKey', '2018-08-21', '2018-08-28', [], 1, 10000)
  console.log(result)
}

test()
