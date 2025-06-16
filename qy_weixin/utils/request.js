// 通用请求工具，自动拼接 API 域名
// 微信小程序环境没有 process.env，需直接写死或用 config 文件
const API_BASE_URL = 'https://www.luxilive.cn/api'; // TODO: 替换为你的后端API域名

function request({ url, method = 'GET', data = {}, header = {} }) {
  // 过滤掉 data 里为 undefined 的字段
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) delete data[key];
  });
  // 强制 Content-Type: application/json
  if (!header['Content-Type']) {
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      header['Content-Type'] = 'application/json';
    }
  }
  console.log('request:', url, data, header);
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE_URL + url,
      method,
      data,
      header,
      success: res => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
}

module.exports = request;
