'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('email', 'password')
  const result = await umeng.v3.app.retention('appKey', '2016-08-28', '2018-08-28', [])
  console.log(result)
}

test()
