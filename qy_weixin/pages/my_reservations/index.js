const request = require('../../utils/request');

Page({
  data: {
    reservations: [],
    user_id: '' // 可用手机号或用户唯一标识
  },
  onLoad() {
    // TODO: 获取当前用户手机号或唯一标识
    const user_id = wx.getStorageSync('user_phone') || '';
    this.setData({ user_id });
    this.fetchReservations(user_id);
  },
  fetchReservations(user_id) {
    request({
      url: '/reservations',
      method: 'GET',
      data: { user_id }
    }).then(res => {
      if (res.code === 0) {
        this.setData({ reservations: res.data });
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },
  cancelReservation(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消该预约吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/reservations/cancel',
            method: 'POST',
            data: { id }
          }).then(res => {
            if (res.code === 0) {
              wx.showToast({ title: '已取消', icon: 'success' });
              this.fetchReservations(this.data.user_id);
            } else {
              wx.showToast({ title: '取消失败', icon: 'none' });
            }
          });
        }
      }
    });
  }
});
