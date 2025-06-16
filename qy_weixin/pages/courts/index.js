const request = require('../../utils/request');

Page({
  data: {
    courts: [],
    venue_id: ''
  },
  onLoad(options) {
    const venue_id = options.venue_id;
    this.setData({ venue_id });
    this.fetchCourts(venue_id);
  },
  fetchCourts(venue_id) {
    request({
      url: '/courts',
      method: 'GET',
      data: { venue_id }
    }).then(res => {
      if (res.code === 0) {
        this.setData({ courts: res.data });
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },
  goToCourtDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/court_detail/index?id=${id}`
    });
  }
});
