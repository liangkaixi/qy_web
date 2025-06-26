/**
 * 判断用户是否已登录（本地有 userInfo）
 * @returns {boolean}
 */
function isLoggedIn() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      return !!(userInfo && userInfo.nickName);
    } catch (e) {
      return false;
    }
  }
  
  module.exports = {
    isLoggedIn
  };