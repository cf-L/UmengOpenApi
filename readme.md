# Umeng Open Api


[![npm version](https://img.shields.io/npm/v/softin-umeng-open-api.svg?style=flat-square)](https://www.npmjs.com/package/softin-umeng-open-api)

### Description

Some Api from Umeng

### Installation

```shell
$ npm install softin-umeng-open-api --save
```

### Demo

```javascript
const co = require('co')
const Umeng = require('./lib')

co(function * () {
  const umeng = new Umeng(email, password)

  const result = yield umeng.newUsers(
    appKey,
    startDate,
    endDate,
    Umeng.UMENGPERIOD.HOURLY)
  console.log(result)
})
```