'use strict'

const Restrict = require('./lib/restrict')
const Cookie = require('./lib/cookie')

const superagent = require('superagent')
const format = require('util').format

class Umeng {
  static get Api() {
    return {
      token: '/authorize',
      app: {
        list: '/apps',
        count: '/apps/count'
      },
      data: {
        channels: '/channels',
        versions: '/versions',
        today: '/today_data',
        yesterday: '/yesterday_data',
        anyDate: '/base_data',
        segmentations: '/segmentations',
        newUsers: '/new_users',
        activeUsers: '/active_users',
        launches: '/launches',
        durations: '/durations',
        retentions: '/retentions'
      },
      event: {
        groupList: '/events/group_list',
        eventList: '/events/event_list',
        dailyData: '/events/daily_data',
        parameterList: '/events/parameter_list',
        parameterData: '/events/parameter_data'
      },
      feedback: '/feedbacks',
      summary: 'http://mobile.umeng.com/ht/api/v3/app/whole/summary?view=summary&relatedId=%s',
      retentionsDetail: 'http://mobile.umeng.com/ht/api/v3/app/retention/view?relatedId=%s',
      trend: 'http://mobile.umeng.com/ht/api/v3/app/whole/trend?relatedId=%s'
    }
  }

  static get UMENGPERIOD() {
    return {
      HOURLY: 'hourly',
      DAILY: 'daily',
      WEEKLY: 'weekly',
      MONTHLY: 'monthly',
      DAILYPERLAUNCH: 'daily_per_launch'
    }
  }

  static get RETENTIONS() {
    return {
      TYPE: {
        NEW: 'newUser',
        ACTIVE: 'activeUser'
      },
      UNIT: {
        DAILY: 'day',
        WEEKLY: 'week',
        MONTHLY: 'month'
      }
    }
  }

  static get TRENDVIEW() {
    return {
      NEWUSERS: 'trend_new_users',
      ACTIVEUSERS: 'trend_active_users',
      LAUNCHES: 'trend_launches',
      INSTALLATIONS: 'trend_installations',
      MORROWRETENTION: 'trend_morrow_retention',
      AVGDURATION: 'trend_avg_duration',
      DAILYAVGDURATION: 'trend_daily_avg_duration',
      DAILYAVGLAUNCHES: 'trend_daily_avg_launches'
    }
  }

  constructor(email, password) {
    if (!email) {
      throw Error('User email required')
    }

    if (!password) {
      throw Error('User password required')
    }

    this.email = email
    this.password = password
    this.cookie = new Cookie()
  }

  async getCookie() {
    if (!this.email || !this.password) {
      throw Error('User email and password are required')
    }

    const cookie = await this.cookie.get(this.email, this.password)
    return cookie
  }

  async token() {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      const link = this.host + '/authorize'
      const res = await superagent.post(link)
        .send({
          email: this.email,
          password: this.password
        }).timeout(1000 * 60)

      const result = JSON.parse(res.text)

      if (result.code === 200 && result.auth_token) {
        return result.auth_token
      }

      return null
    } catch (error) {
      throw error
    }
  }

  async appsList(page, limit, query) {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      let link = this.host + Umeng.Api.app.list + `?per_page=${limit || 20}&page=${page || 1}`

      if (query) {
        link += `&q=${query}`
      }

      const res = await superagent.get(link)
        .auth(this.email, this.password)
        .timeout(1000 * 60)

      return JSON.parse(res.text)
    } catch (error) {
      throw error
    }
  }

  async appsCount() {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      const link = this.host + Umeng.Api.app.count

      const res = await superagent.get(link)
        .auth(this.email, this.password)
        .timeout(1000 * 60)

      const result = JSON.parse(res.text)

      return result.count || 0
    } catch (error) {
      throw error
    }
  }

  async versions(appKey, date) {
    try {
      if (!this.userInfoCorrect) { return null }

      let link = this.host + Umeng.Api.data.versions + `?appkey=${appKey}`

      if (date !== undefined) {
        link += `&date=${date}`
      }

      await Restrict.wait()
      const res = await superagent.get(link).auth(this.email, this.password)
      return JSON.parse(res.text)
    } catch (error) {
      throw error
    }
  }

  async todayData(appKey) {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      const link = this.host + Umeng.Api.data.today + `?appkey=${appKey}`

      const res = await superagent.get(link)
        .auth(this.email, this.password)
        .timeout(1000 * 60)

      const result = JSON.parse(res.text)

      return result
    } catch (error) {
      throw error
    }
  }

  async yesterdayData(appKey) {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      const link = this.host + Umeng.Api.data.yesterday + `?appkey=${appKey}`

      const res = await superagent.get(link)
        .auth(this.email, this.password)
        .timeout(1000 * 60)

      const result = JSON.parse(res.text)

      return result
    } catch (error) {
      throw error
    }
  }

  async any(appKey, date) {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      const link = this.host + Umeng.Api.data.anyDate + `?appkey=${appKey}&date=${date}`

      const res = await superagent.get(link)
        .auth(this.email, this.password)
        .timeout(1000 * 60)

      const result = JSON.parse(res.text)

      return result
    } catch (error) {
      throw error
    }
  }

  async newUsers(appKey, start, end, parameters) {
    if (parameters && parameters.period && parameters.period === Umeng.UMENGPERIOD.DAILYPERLAUNCH) {
      throw Error('Unsupported period!')
    }
    return await this._appData(Umeng.Api.data.newUsers, appKey, start, end, parameters)
  }

  async activeUsers(appKey, start, end, parameters) {
    if (parameters && parameters.period && parameters.period === Umeng.UMENGPERIOD.DAILYPERLAUNCH) {
      throw Error('Unsupported period!')
    }
    return await this._appData(Umeng.Api.data.activeUsers, appKey, start, end, parameters)
  }

  async launches(appKey, start, end, parameters) {
    if (parameters && parameters.period && parameters.period === Umeng.UMENGPERIOD.DAILYPERLAUNCH) {
      throw Error('Unsupported period!')
    }
    return await this._appData(Umeng.Api.data.launches, appKey, start, end, parameters)
  }

  async retentions(appKey, start, end, parameters) {
    if (parameters && parameters.period &&
      (parameters.period === Umeng.UMENGPERIOD.HOURLY || parameters.period === Umeng.UMENGPERIOD.DAILYPERLAUNCH)) {
      throw Error('Unsupported period!')
    }

    return await this._appData(Umeng.Api.data.retentions, appKey, start, end, parameters)
  }

  async durations(appKey, start, end, parameters) {
    if (parameters && parameters.period && (parameters.period === Umeng.UMENGPERIOD.DAILY || parameters.period === Umeng.UMENGPERIOD.DAILYPERLAUNCH)) {
      return await this._appData(Umeng.Api.data.durations, appKey, start, end, parameters)
    } else {
      throw Error('Unsupported period!')
    }
  }

  async summary(appKey) {
    try {
      const link = format(Umeng.Api.summary, appKey)
      const res = await superagent.get(link).timeout(1000 * 60)
      return JSON.parse(res.text)
    } catch (error) {
      throw error
    }
  }

  async retentionsDetail(appKey, start, end, type, unit, page, limit) {
    if (!Umeng.RETENTIONS.TYPE[type]) {
      throw Error(`Unsupported type: ${type}`)
    }

    if (!Umeng.RETENTIONS.UNIT[unit]) {
      throw Error(`Unsupported unit: ${unit}`)
    }

    try {
      const link = format(Umeng.Api.retentionsDetail, appKey)

      const res = await superagent.post(link)
        .send({
          fromDate: start,
          toDate: end,
          timeUnit: unit,
          page: page,
          pageSize: limit,
          type: type,
          view: 'retention',
          channel: [],
          version: [],
          relatedId: appKey
        })
        .timeout(1000 * 60)

      const result = JSON.parse(res.text)

      if (result.sCode && result.sCode === 200) {
        return result.data
      } else {
        const message = result.sMsg || result.msg || 'Unknow error'
        throw Error(message)
      }
    } catch (error) {
      throw error
    }
  }

  async trend(appKey, fromDate, toDate, view) {
    try {
      const cookie = await this.getCookie()
      if (!cookie) { return null }

      const link = format(Umeng.Api.trend, appKey)
      const res = await superagent.post(link)
        .set('Cookie', cookie)
        .send({
          fromDate: fromDate,
          toDate: toDate,
          timeUnit: 'day',
          view: view,
          relatedId: appKey
        })

      const result = JSON.parse(res.text)
      const obj = {}

      if (result.data && result.data.dates && result.data.items && result.data.items.length > 0) {
        const dates = result.data.dates
        const items = result.data.items[0].data
        if (items && dates.length === items.length) {
          for (let i = 0; i < dates.length; i++) {
            obj[dates[i]] = items[i]
          }
        }
      }

      return obj
    } catch (error) {
      throw error
    }
  }

  get userInfoCorrect() {
    return this.email !== undefined && this.email !== null && this.email !== '' &&
      this.password !== undefined && this.password !== null
  }

  get host() {
    return 'http://api.umeng.com'
  }

  async _appData(api, appKey, start, end, parameters) {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      let link = this.host + api + `?appkey=${appKey}&start_date=${start}&end_date=${end}`

      if (parameters && parameters.period) {
        link += `&period_type=${parameters.period}`
      }

      if (parameters && parameters.versions) {
        link += `&versions=${parameters.versions}`
      }

      const res = await superagent.get(link)
        .auth(this.email, this.password)
        .timeout(1000 * 60)

      const result = JSON.parse(res.text)

      return result
    } catch (error) {
      throw error
    }
  }
}

module.exports = Umeng
