/**
 * @fileoverview 个人中心页，微信一键登录官方实现，登录成功后将用户信息发送到 /api/onLogin
 */
const { isLoggedIn } = require('../../utils/auth.js');

Page({
    data: {
      userInfo: {},
      hasUserInfo: false
    },
  
    /**
     * 用户点击"微信一键登录"按钮时触发
     * 只允许在点击事件中调用 wx.getUserProfile
     */
    onTapLogin() {
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明用途
        success: (res) => {
          console.log('获取用户信息成功:', res.userInfo);
          console.log('头像URL:', res.userInfo.avatarUrl);
          // 先调用 wx.login 获取 code
          wx.login({
            success: (loginRes) => {
              if (!loginRes.code) {
                wx.showToast({ title: '微信登录失败', icon: 'none' });
                console.error('wx.login 未获取到 code', loginRes);
                return;
              }
              console.log('wx.login 成功，code:', loginRes.code);
  
              // 发送 code 和用户信息到后端
              wx.request({
                url: 'https://www.luxilive.cn/api/onLogin',
                method: 'POST',
                header: { 'content-type': 'application/json' },
                data: {
                  code: loginRes.code,
                  userInfo: res.userInfo
                },
                success: (apiRes) => {
                  console.log('后端 /api/onLogin 返回:', apiRes.data);
                  if (apiRes.data && apiRes.data.code === 0) {
                    this.setData({
                      userInfo: res.userInfo,
                      hasUserInfo: true
                    });
                    wx.setStorageSync('userInfo', res.userInfo);
                    wx.showToast({ title: '登录成功', icon: 'success' });
                    setTimeout(() => {
                    wx.navigateBack(); // 返回上一个页面
                    }, 800);
                  } else {
                    wx.showToast({ title: apiRes.data.msg || '登录失败', icon: 'none' });
                  }
                },
                fail: (err) => {
                  console.error('请求 /api/onLogin 失败:', err);
                  wx.showToast({ title: '网络错误', icon: 'none' });
                }
              });
            },
            fail: (err) => {
              console.error('wx.login 失败:', err);
              wx.showToast({ title: '微信登录失败', icon: 'none' });
            }
          });
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err);
          wx.showToast({ title: '获取用户信息失败', icon: 'none' });
        }
      });
    },

    onShow() {
      if (!isLoggedIn()) {
        wx.navigateTo({
          url: '/pages/login/index'
        });
      }
    }
  });