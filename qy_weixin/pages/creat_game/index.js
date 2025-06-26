/**
 * 创建游戏页面逻辑
 * @fileoverview 创建比赛功能，包含表单选择、权限切换、日志记录等
 */

const logger = require('../../utils/logger')
const { supabase } = require('../../utils/api') // 确保 utils/api.js 已正确导出 supabase

Page({
  data: {
    sports: ['气排球','篮球','羽毛球'], // 运动类型列表
    sportIndex: 0,
    regions: ['区域A', '区域B', '区域C'], // 区域/分组列表
    regionIndex: 0,
    date: new Date().toISOString().slice(0, 10), // 默认今天
    time: '18:00',
    permission: 'public', // 活动权限
  },

  /**
   * 运动类型选择
   * @param {Object} e picker事件对象
   */
  onSportChange(e) {
    this.setData({ sportIndex: e.detail.value })
    logger.info('运动类型选择', { value: this.data.sports[e.detail.value] })
  },

  /**
   * 区域选择
   * @param {Object} e picker事件对象
   */
  onRegionChange(e) {
    this.setData({ regionIndex: e.detail.value })
    logger.info('区域选择', { value: this.data.regions[e.detail.value] })
  },

  /**
   * 日期选择
   * @param {Object} e picker事件对象
   */
  onDateChange(e) {
    this.setData({ date: e.detail.value })
    logger.info('日期选择', { value: e.detail.value })
  },

  /**
   * 时间选择
   * @param {Object} e picker事件对象
   */
  onTimeChange(e) {
    this.setData({ time: e.detail.value })
    logger.info('时间选择', { value: e.detail.value })
  },

  /**
   * 权限切换
   * @param {Object} e tab点击事件对象
   */
  onPermissionChange(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ permission: value })
    logger.info('权限切换', { value })
  },

  /**
   * 提交表单，创建比赛
   * 1. 组装数据
   * 2. 日志记录
   * 3. 调用 Supabase 插入数据
   * 4. 反馈用户
   */
  async onSubmit() {
    const { sports, sportIndex, regions, regionIndex, date, time, permission } = this.data
    const userId = wx.getStorageSync('user_id') // 假设已登录并存储
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      logger.warn('未登录用户尝试创建比赛')
      return
    }
    // 合并日期和时间为 ISO 格式
    const matchTime = `${date}T${time}:00+08:00`

    logger.info('创建比赛提交', {
      sport_type: sports[sportIndex],
      group_type: regions[regionIndex],
      creator_id: userId,
      match_time: matchTime,
      status: 'pending',
      permission
    })

    try {
      // 插入数据到 qy_matches 表
      const { data, error } = await supabase
        .from('qy_matches')
        .insert([{
          sport_type: sports[sportIndex],
          group_type: regions[regionIndex],
          creator_id: userId,
          match_time: matchTime,
          status: 'pending'
          // 如需扩展可加 venue_id, court_id 等
        }])
      if (error) {
        logger.error('Supabase 插入失败', error)
        wx.showToast({ title: '创建失败', icon: 'none' })
        return
      }
      wx.showToast({ title: '创建成功', icon: 'success' })
      logger.info('比赛创建成功', data)
      // 可选：跳转到比赛详情页
      // wx.navigateTo({ url: `/pages/match_detail/index?id=${data[0].id}` })
    } catch (err) {
      logger.error('网络或未知错误', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }
  },

  /**
   * 页面加载
   */
  onLoad() {
    logger.info('创建游戏页面加载')
  }
})