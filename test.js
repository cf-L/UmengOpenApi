'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('email', 'password')
  const cookies = await umeng.getCookie()
  console.log(cookies)
}

test()
