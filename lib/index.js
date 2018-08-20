'use strict'

const Restrict = require('./restrict')
const superagent = require('superagent')

const Api = {
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
  feedback: '/feedbacks'
}

const UMENGPERIOD = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
}

class Umeng {
  constructor(email, password) {
    if (!email) {
      throw Error('User email required')
    }

    if (!password) {
      throw Error('User password required')
    }

    this.email = email
    this.password = password
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
        }).timeout(1000 * 20)

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
      let link = this.host + Api.app.list + `?per_page=${limit || 20}&page=${page || 1}`

      if (query) {
        link += `&q=${query}`
      }

      const res = await superagent.get(link).auth(this.email, this.password)

      return JSON.parse(res.text)
    } catch (error) {
      throw error
    }
  }

  async appsCount() {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      const link = this.host + Api.app.count
      const res = await superagent.get(link).auth(this.email, this.password)
      const result = JSON.parse(res.text)

      return result.count || 0
    } catch (error) {
      throw error
    }
  }

  async todayData(appKey) {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      const link = this.host + Api.data.today + `?appkey=${appKey}`
      const res = await superagent.get(link).auth(this.email, this.password)
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
      const link = this.host + Api.data.yesterday + `?appkey=${appKey}`
      const res = await superagent.get(link).auth(this.email, this.password)
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
      const link = this.host + Api.data.anyDate + `?appkey=${appKey}&date=${date}`
      const res = await superagent.get(link).auth(this.email, this.password)
      const result = JSON.parse(res.text)

      return result
    } catch (error) {
      throw error
    }
  }

  async newUsers(appKey, start, end, period) {
    return await this._appData(Api.data.newUsers, appKey, start, end, period)
  }

  async activeUsers(appKey, start, end, period) {
    return await this._appData(Api.data.activeUsers, appKey, start, end, period)
  }

  async launches(appKey, start, end, period) {
    return await this._appData(Api.data.launches, appKey, start, end, period)
  }

  async durations(appKey, start, end, period) {
    return await this._appData(Api.data.durations, appKey, start, end, period)
  }

  async retentions(appKey, start, end, period) {
    if (period === UMENGPERIOD.HOURLY) {
      throw Error(`Period type of hourly is unavailable for retentions api`)
    }

    return await this._appData(Api.data.retentions, appKey, start, end, period)
  }

  get userInfoCorrect() {
    return this.email !== undefined && this.email !== null && this.email !== '' &&
      this.password !== undefined && this.password !== null
  }

  get host() {
    return 'http://api.umeng.com'
  }

  async _appData(api, appKey, start, end, period) {
    try {
      if (!this.userInfoCorrect) { return null }

      await Restrict.wait()
      let link = this.host + api + `?appkey=${appKey}&start_date=${start}&end_date=${end}`

      if (period) {
        link += `&period_type=${period}`
      }

      console.log(link)

      const res = await superagent.get(link).auth(this.email, this.password)
      const result = JSON.parse(res.text)

      return result
    } catch (error) {
      throw error
    }
  }
}

Umeng.UMENGPERIOD = UMENGPERIOD

module.exports = Umeng
