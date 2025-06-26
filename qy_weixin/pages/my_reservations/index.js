/**
 * 创建游戏页面逻辑
 * @fileoverview 定场联动逻辑+卡片式picker表单
 */
const logger = require('../../utils/logger')
const api = require('../../utils/api')
const { supabase } = require('../../utils/api')

const areaTypesPreset = [
  { label: '全场', value: 'full' },
  { label: '半场', value: 'part' }
];

Page({
  data: {
    courtTypes: [],
    courtTypeIndex: 0,
    areaTypes: [],
    areaTypeIndex: 0,
    filteredCourts: [],
    courtIndex: 0,
    dateOptions: [],
    dateIndex: 0,
    availableSlots: [],
    slotIndex: 0,
    permission: 'public',
    // 其余如用户id等
  },

  onShow() {
    const userId = wx.getStorageSync('user_id');
    if (!userId) {
      const currentPage = getCurrentPages().pop();
      const route = currentPage ? currentPage.route : '/pages/my_reservations/index';
      wx.redirectTo({ url: `/pages/login/index?redirect=${encodeURIComponent('/' + route)}` });
    }
  },

  async onLoad() {
    // 登录校验
    const userId = wx.getStorageSync('user_id');
    if (!userId) {
      const currentPage = getCurrentPages().pop();
      const route = currentPage ? currentPage.route : '/pages/my_reservations/index';
      wx.redirectTo({ url: `/pages/login/index?redirect=${encodeURIComponent('/' + route)}` });
      return;
    }
    this.setDateOptions();
    await this.fetchCourtTypes();
  },

  setDateOptions() {
    const today = new Date();
    const dateOptions = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return {
        label: `${month}月${day}日${i === 0 ? ' (今天)' : ''}`,
        value: `${year}-${month}-${day}`
      };
    });
    this.setData({
      dateOptions,
      dateIndex: 0
    });
  },

  async fetchCourtTypes() {
    const res = await api.getCourtTypes();
    if (res.code === 0 && res.data.length) {
      this.setData({ courtTypes: res.data });
      // 默认选第一个类型
      await this.onCourtTypeChange({ detail: { value: 0 } });
    }
  },

  async onCourtTypeChange(e) {
    const courtTypeIndex = Number(e.detail.value);
    const courtTypeId = this.data.courtTypes[courtTypeIndex].id;
    // 判断是否为篮球，显示分区
    const isBasketball = this.data.courtTypes[courtTypeIndex].name.includes('篮球');
    this.setData({
      courtTypeIndex,
      areaTypes: isBasketball ? areaTypesPreset : [],
      areaTypeIndex: 0
    });
    await this.fetchCourtsByTypeAndArea();
  },

  async onAreaTypeChange(e) {
    const areaTypeIndex = Number(e.detail.value);
    this.setData({ areaTypeIndex });
    await this.fetchCourtsByTypeAndArea();
  },

  async fetchCourtsByTypeAndArea() {
    const { courtTypes, courtTypeIndex, areaTypes, areaTypeIndex } = this.data;
    const courtTypeId = courtTypes[courtTypeIndex].id;
    const areaType = areaTypes.length ? areaTypes[areaTypeIndex].value : '';
    const res = await api.getCourtsByType(courtTypeId);
    let courts = res.code === 0 ? res.data : [];
    // 篮球分区过滤
    if (areaTypes.length && areaType) {
      courts = courts.filter(c => c.area_type === areaType);
    }
    this.setData({ filteredCourts: courts, courtIndex: 0 });
    await this.updateAvailableSlots();
  },

  async onCourtChange(e) {
    this.setData({ courtIndex: Number(e.detail.value) });
    await this.updateAvailableSlots();
  },

  onDateChange(e) {
    this.setData({ dateIndex: Number(e.detail.value) }, () => {
      this.updateAvailableSlots();
    });
  },

  async updateAvailableSlots() {
    const { filteredCourts, courtIndex, dateOptions, dateIndex } = this.data;
    if (!filteredCourts.length || !dateOptions.length) {
      this.setData({ availableSlots: [], slotIndex: 0 });
      return;
    }
    const courtId = filteredCourts[courtIndex].id;
    const date = dateOptions[dateIndex].value;
    const res = await api.getDisabledSlots(date, courtId);
    let disables = [];
    if (res && res.data && res.data[courtId]) {
      disables = res.data[courtId];
    }
    // 生成可用时间段（8:00-22:00，每小时一格）
    const slots = [];
    for (let h = 8; h < 22; h++) {
      const label = `${h}:00-${h + 1}:00`;
      const value = `${h.toString().padStart(2, '0')}:00:00`;
      // 判断是否被禁用
      const slotStart = h * 60;
      const slotEnd = (h + 1) * 60;
      const disabled = disables.some(({ start, end }) => Math.max(slotStart, start) < Math.min(slotEnd, end));
      if (!disabled) {
        slots.push({ label, value });
      }
    }
    this.setData({ availableSlots: slots, slotIndex: 0 });
  },

  onSlotChange(e) {
    this.setData({ slotIndex: Number(e.detail.value) });
  },

  onPermissionChange(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ permission: value });
  },

  async onSubmit() {
    const { courtTypes, courtTypeIndex, areaTypes, areaTypeIndex, filteredCourts, courtIndex, dateOptions, dateIndex, availableSlots, slotIndex, permission } = this.data;
    const userId = wx.getStorageSync('user_id');
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (!courtTypes.length || !filteredCourts.length || !availableSlots.length) {
      wx.showToast({ title: '请完整选择', icon: 'none' });
      return;
    }
    const matchTime = `${dateOptions[dateIndex].value}T${availableSlots[slotIndex].value}`;
    const sportType = courtTypes[courtTypeIndex].name;
    const groupType = areaTypes.length ? areaTypes[areaTypeIndex].label : '';
    const courtId = filteredCourts[courtIndex].id;
    try {
      const { data, error } = await supabase
        .from('qy_matches')
        .insert([{
          sport_type: sportType,
          group_type: groupType,
          creator_id: userId,
          match_time: matchTime,
          court_id: courtId,
          status: 'pending'
        }]);
      if (error) {
        wx.showToast({ title: '创建失败', icon: 'none' });
        return;
      }
      wx.showToast({ title: '创建成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '网络错误', icon: 'none' });
    }
  }
});