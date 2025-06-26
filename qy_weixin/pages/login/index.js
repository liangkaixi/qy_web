Page({
    data: {
      redirect: ''
    },
    onLoad(options) {
      if (options.redirect) {
        this.setData({ redirect: decodeURIComponent(options.redirect) });
      }
    },
    /**
     * 用户点击“微信一键登录”按钮时触发
     */
    onTapLogin() {
        wx.getUserProfile({
          desc: '用于完善会员资料',
          success: (res) => {
            wx.login({
              success: (loginRes) => {
                if (!loginRes.code) {
                  wx.showToast({ title: '微信登录失败', icon: 'none' });
                  return;
                }
                wx.request({
                  url: 'https://www.luxilive.cn/api/onLogin', // 你的后端API
                  method: 'POST',
                  header: { 'content-type': 'application/json' },
                  data: {
                    code: loginRes.code,
                    userInfo: res.userInfo
                  },
                  success: (apiRes) => {
                    if (apiRes.data && apiRes.data.code === 0 && apiRes.data.data && apiRes.data.data.user && apiRes.data.data.user.id) {
                      wx.setStorageSync('user_id', apiRes.data.data.user.id);
                      wx.setStorageSync('userInfo', res.userInfo);
                      wx.showToast({ title: '登录成功', icon: 'success' });
                      setTimeout(() => {
                        if (this.data.redirect) {
                          // 判断是否是 tabbar 页面
                          const tabbarPages = [
                            '/pages/index/index',
                            '/pages/reservation/index',
                            '/pages/my_reservations/index',
                            '/pages/me/index'
                          ];
                          const redirectPath = this.data.redirect.split('?')[0];
                          if (tabbarPages.includes(redirectPath)) {
                            wx.switchTab({ url: redirectPath });
                          } else {
                            wx.redirectTo({ url: this.data.redirect });
                          }
                        } else {
                          wx.switchTab({ url: '/pages/index/index' });
                        }
                      }, 800);
                    } else {
                      wx.showToast({ title: apiRes.data.msg || '登录失败', icon: 'none' });
                    }
                  },
                  fail: (err) => {
                    wx.showToast({ title: '网络错误', icon: 'none' });
                  }
                });
              },
              fail: (err) => {
                wx.showToast({ title: '微信登录失败', icon: 'none' });
              }
            });
          },
          fail: (err) => {
            wx.showToast({ title: '获取用户信息失败', icon: 'none' });
          }
        });
      }
    });