const request = require('../../utils/request');

function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

Page({
  data: {
    court: null,
    date: '',
    start_time: '',
    duration: 1,
    phone: '',
    submitting: false,
    slots: [], // 可预约时间段
    reservedSlots: [] // 已被预约的时间段
  },
  onLoad(options) {
    const id = options.id;
    this.fetchCourtDetail(id);
    this.initDate();
  },
  fetchCourtDetail(id) {
    request({
      url: '/court_detail',
      method: 'GET',
      data: { id }
    }).then(res => {
      if (res.code === 0) {
        this.setData({ court: res.data });
        this.fetchReservedSlots();
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },
  initDate() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    this.setData({ date: dateStr });
  },
  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },
  onDateChange(e) {
    this.setData({ date: e.detail.value }, () => {
      this.fetchReservedSlots();
    });
  },
  fetchReservedSlots() {
    const { court, date } = this.data;
    if (!court || !date) return;
    request({
      url: '/reservations',
      method: 'GET',
      data: { court_id: court.id, date }
    }).then(res => {
      if (res.code === 0) {
        const reserved = res.data.map(item => item.start_time);
        this.setData({ reservedSlots: reserved }, () => {
          this.genSlots();
        });
      }
    });
  },
  genSlots() {
    // 假设可预约时间段为 08:00-22:00，每小时一段
    const slots = [];
    for (let h = 8; h < 22; h++) {
      const time = (h < 10 ? '0' : '') + h + ':00';
      slots.push({
        value: time,
        label: time,
        disabled: this.data.reservedSlots.includes(time)
      });
    }
    this.setData({ slots });
  },
  selectSlot(e) {
    const value = e.currentTarget.dataset.value;
    const slot = this.data.slots.find(s => s.value === value);
    if (slot && !slot.disabled) {
      this.setData({ start_time: value });
    }
  },
  selectDuration(e) {
    this.setData({ duration: Number(e.currentTarget.dataset.value) });
  },
  submitReservation() {
    const { court, date, start_time, duration, phone } = this.data;
    if (!date || !start_time || !duration || !phone) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    if (!isValidPhone(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    request({
      url: '/reservations',
      method: 'POST',
      data: {
        court_id: court.id,
        date,
        start_time,
        duration,
        price: court.price || 0,
        phone
      }
    }).then(res => {
      this.setData({ submitting: false });
      if (res.code === 0) {
        wx.showToast({ title: '预约成功', icon: 'success' });
        wx.navigateBack();
      } else {
        wx.showToast({ title: res.msg || '预约失败', icon: 'none' });
      }
    }).catch(() => {
      this.setData({ submitting: false });
      wx.showToast({ title: '预约失败', icon: 'none' });
    });
  }
});
