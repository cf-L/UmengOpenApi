'use strict'

const co = require('co')
const Umeng = require('./index')

async function test() {
  const umeng = new Umeng('email', 'password')
  const result = await umeng.frequencyDistributed('appKey', '2018-08-26', '2018-08-26', '')
  console.log(result)
}

test()
