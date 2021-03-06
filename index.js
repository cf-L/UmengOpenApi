'use strict'

const Restrict = require('./lib/restrict')
const Cookie = require('./lib/cookie')

const superagent = require('superagent')
const format = require('util').format

const timeout = 1000 * 60 * 30

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
      retentionsTrend: 'http://mobile.umeng.com/ht/api/v3/app/retention/trend?relatedId=%s',
      trend: 'http://mobile.umeng.com/ht/api/v3/app/whole/trend?relatedId=%s',
      pageDetail: 'http://mobile.umeng.com/apps/%s/reports/load_chart_data?start_date=%s&end_date=%s&versions%5B%5D=%s&channels%5B%5D=&segments%5B%5D=&time_unit=daily&stats=depth',
      durationDistributed: 'http://mobile.umeng.com/apps/%s/reports/load_table_data?page=1&per_page=30&start_date=%s&end_date=%s&versions%5B%5D=%s&channels%5B%5D=&segments%5B%5D=&time_unit=daily&stats=duration&stat_type=daily_per_launch',
      frequencyDistributed: 'http://mobile.umeng.com/apps/%s/reports/load_table_data?page=1&per_page=30&start_date=%s&end_date=%s&versions%5B%5D=%s&channels%5B%5D=&segments%5B%5D=&time_unit=daily&stats=frequency&stat_type=daily',
      avgDuration: 'https://mobile.umeng.com/apps/%s/reports/load_chart_data?start_date=%s&end_date=%s&versions%5B%5D=%s&channels%5B%5D=&segments%5B%5D=&time_unit=daily&stats=duration&stat_type=%s',
      avgDailyLaunches: 'https://mobile.umeng.com/apps/%s/reports/load_chart_data?start_date=%s&end_date=%s&versions%5B%5D=%s&channels%5B%5D=&segments%5B%5D=&time_unit=daily&stats=frequency&stat_type=daily',
      v3: {
        app: {
          trend: 'http://mobile.umeng.com/ht/api/v3/app/user/%s/trend?relatedId=%s',
          detail: 'http://mobile.umeng.com/ht/api/v3/app/user/%s/detail?relatedId=%s',
          retention: 'http://mobile.umeng.com/ht/api/v3/app/retention/trend?relatedId=%s'
        }
      }
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

  static get V3() {
    return {
      APP: {
        USER: {
          NEW: { KEY: 'new', VALUE: 'newUser' },
          ACTIVE: { KEY: 'active', VALUE: 'activeUser' },
          LAUNCH: { KEY: 'launch', VALUE: 'launch' },
          RETENTION: { KEY: 'retention ', VALUE: 'retentionTrend' }
        }
      }
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
      const res = await superagent.post(link).timeout(timeout)
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
        .timeout(timeout)

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
        .timeout(timeout)

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
      const res = await superagent.get(link).auth(this.email, this.password).timeout(timeout)
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
        .timeout(timeout)

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
        .timeout(timeout)

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
        .timeout(timeout)

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
      const cookie = await this.getCookie()
      const link = format(Umeng.Api.summary, appKey)
      const res = await superagent.get(link).set('cookie', cookie).timeout(timeout)
      return JSON.parse(res.text)
    } catch (error) {
      throw error
    }
  }

  async retentionsDetail(appKey, start, end, type, unit, page, limit, versions) {
    try {
      const link = format(Umeng.Api.retentionsDetail, appKey)
      const cookie = await this.getCookie()

      const res = await superagent.post(link)
        .set('cookie', cookie)
        .send({
          fromDate: start,
          page: page,
          pageSize: limit,
          relatedId: appKey,
          timeUnit: unit,
          toDate: end,
          type: type,
          view: 'retention',
          version: versions || []
        })
        .timeout(timeout)

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

  async retentionsTrends(appKey, start, end, type, unit, versions) {
    try {
      const link = format(Umeng.Api.retentionsTrend, appKey)
      const cookie = await this.getCookie()

      const res = await superagent.post(link)
        .set('cookie', cookie)
        .send({
          channel: [],
          fromDate: start,
          index: 0,
          relatedId: appKey,
          timeUnit: unit,
          toDate: end,
          type: type,
          version: versions || [],
          view: 'retentionTrend'
        })
        .timeout(timeout)

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
        .timeout(timeout)

      const result = JSON.parse(res.text)
      const obj = {}

      if (result.data && result.data.dates && result.data.items && result.data.items.length > 0) {
        const dates = result.data.dates
        const items = view === Umeng.TRENDVIEW.MORROWRETENTION ? result.data.items[1].data : result.data.items[0].data
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

      const options = parameters || {}
      options.period = options.period || Umeng.UMENGPERIOD.DAILY

      if (options && options.period) {
        link += `&period_type=${options.period}`
      }

      if (options && options.versions) {
        link += `&versions=${options.versions}`
      }

      const res = await superagent.get(link)
        .auth(this.email, this.password)
        .timeout(timeout)

      const result = JSON.parse(res.text)

      return result
    } catch (error) {
      throw error
    }
  }

  async pageDetail(appKey, startDate, endDate, version) {
    try {
      const link = format(Umeng.Api.pageDetail, appKey.split('').reverse().join(''), startDate, endDate, version || '')
      const cookie = await this.getCookie()
      const res = await superagent.get(link).set('Cookie', cookie).timeout(timeout)
      return JSON.parse(res.text)
    } catch (error) {
      throw error
    }
  }

  async avgPage(appKey, startDate, endDate, version) {
    try {
      const result = await this.pageDetail(appKey, startDate, endDate, version)
      if (result.summary && result.summary.value) {
        return result.summary.value
      }
      return 0
    } catch (error) {
      throw error
    }
  }

  async durationDistributed(appKey, startDate, endDate, version) {
    try {
      const reverseAppKey = appKey.split('').reverse().join('')
      const link = format(Umeng.Api.durationDistributed, reverseAppKey, startDate, endDate, version || '')
      const cookie = await this.getCookie()
      const res = await superagent.get(link).set('Cookie', cookie).timeout(timeout)
      return JSON.parse(res.text)
    } catch (error) {
      throw error
    }
  }

  async frequencyDistributed(appKey, startDate, endDate, version) {
    try {
      const reverseAppKey = appKey.split('').reverse().join('')
      const link = format(Umeng.Api.frequencyDistributed, reverseAppKey, startDate, endDate, version || '')
      const cookie = await this.getCookie()
      const res = await superagent.get(link).set('cookie', cookie).timeout(timeout)
      return JSON.parse(res.text)
    } catch (error) {
      throw error
    }
  }

  async avgSingleUseDuration(appKey, date, version) {
    return this._avgDuration('daily_per_launch', appKey, date, version)
  }

  async avgDailyUsageDuration(appKey, date, version) {
    return this._avgDuration('daily', appKey, date, version)
  }

  async avgDailyLaunches(appKey, date, version) {
    try {
      const reverseKey = appKey.split('').reverse().join('')
      const link = format(Umeng.Api.avgDailyLaunches, reverseKey, date, date, version)
      const cookie = await this.getCookie()
      const res = await superagent.get(link).set('cookie', cookie).timeout(timeout)
      const result = JSON.parse(res.text)
      if (result.summary && result.summary.value) {
        return result.summary.value
      }
      return 0
    } catch (error) {
      throw error
    }
  }

  get v3() {
    return {
      app: {
        trend: {
          newUser: async(appKey, startDate, endDate, version) => {
            return await this._v3_app_trend(Umeng.V3.APP.USER.NEW, appKey, startDate, endDate, version)
          },
          activeUser: async(appKey, startDate, endDate, version) => {
            return await this._v3_app_trend(Umeng.V3.APP.USER.ACTIVE, appKey, startDate, endDate, version)
          },
          launch: async(appKey, startDate, endDate, version) => {
            return await this._v3_app_trend(Umeng.V3.APP.USER.LAUNCH, appKey, startDate, endDate, version)
          }
        },
        detail: {
          newUser: async(appKey, startDate, endDate, version, page, pageSize) => {
            return await this._v3_app_detail(Umeng.V3.APP.USER.NEW, appKey, startDate, endDate, version, page, pageSize)
          },
          activeUser: async(appKey, startDate, endDate, version) => {
            return await this._v3_app_detail(Umeng.V3.APP.USER.ACTIVE, appKey, startDate, endDate, version, page, pageSize)
          },
          launch: async(appKey, startDate, endDate, version) => {
            return await this._v3_app_detail(Umeng.V3.APP.USER.LAUNCH, appKey, startDate, endDate, version, page, pageSize)
          }
        },
        retention: async(appKey, startDate, endDate, version) => {
          try {
            const link = format(Umeng.Api.v3.app.retention, appKey)
            const cookie = await this.getCookie()
            const res = await superagent.post(link)
              .set('Cookie', cookie)
              .send({
                channle: [],
                fromDate: startDate,
                toDate: endDate,
                version: version || [],
                view: 'retentionTrend',
                relatedId: appKey,
                timeUnit: 'day',
                index: 0,
                type: 'newUser'
              })
              .timeout(timeout)

            const result = JSON.parse(res.text)
            return result.data || {}
          } catch (error) {
            throw error
          }
        }
      }
    }
  }

  async _v3_app_trend(type, appKey, startDate, endDate, version) {
    try {
      const link = format(Umeng.Api.v3.app.trend, type.KEY, appKey)
      const cookie = await this.getCookie()
      const res = await superagent.post(link).timeout(timeout)
        .set('Cookie', cookie)
        .send({
          channel: [],
          fromDate: startDate,
          toDate: endDate,
          timeUnit: 'day',
          version: version || [],
          view: type.VALUE,
          relatedId: appKey
        })

      const result = JSON.parse(res.text)
      return result.data || {}
    } catch (error) {
      throw error
    }
  }

  async _v3_app_detail(type, appKey, startDate, endDate, version, page, pageSize) {
    try {
      const link = format(Umeng.Api.v3.app.detail, appKey)
      const cookie = await this.getCookie()
      const res = await superagent.post(link).timeout(timeout)
        .set('Cookie', cookie)
        .send({
          channel: [],
          fromDate: startDate,
          toDate: endDate,
          timeUnit: 'day',
          version: version || [],
          view: type.VALUE,
          page: page,
          pageSize: pageSize,
          relatedId: appKey
        })

      const result = JSON.parse(res.text)
      return result.data || {}
    } catch (error) {
      throw error
    }
  }

  async _avgDuration(type, appKey, date, version) {
    try {
      const reverseKey = appKey.split('').reverse().join('')
      const link = format(Umeng.Api.avgDuration, reverseKey, date, date, version, type)
      const cookie = await this.getCookie()
      const res = await superagent.get(link).set('cookie', cookie).timeout(timeout)
      const result = JSON.parse(res.text)
      if (result.summary && result.summary.value) {
        return result.summary.value
      }
      return '00:00:00'
    } catch (error) {
      throw error
    }
  }
}

module.exports = Umeng
