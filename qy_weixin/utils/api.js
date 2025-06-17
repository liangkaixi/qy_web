// qy_weixin/utils/api.js
const request = require('./request.js');

// 获取场馆列表
function getVenues() {
  return request({ url: '/venues' });
}

// 获取场地类型
function getCourtTypes() {
  return request({ url: '/court_types' });
}

function getCourts(venue_id) {
  if (venue_id === undefined || venue_id === null || venue_id === "") {
    return request({ url: '/courts' });
  }
  return request({ url: '/courts', data: { venue_id } });
}


// 获取场地详情
function getCourtDetail(id) {
  return request({ url: '/court_detail', data: { id } });
}

// 获取预约（按手机号查）
function getReservations(user_id) {
  return request({ url: '/reservations', data: { user_id } });
}

// 新建预约
function createReservation({ court_id, date, start_time, duration, price, phone }) {
  return request({
    url: '/reservations',
    method: 'POST',
    data: { court_id, date, start_time, duration, price, phone },
    header: { 'content-type': 'application/json' }
  });
}

// 取消预约
function cancelReservation(id) {
  return request({
    url: '/reservations/cancel',
    method: 'POST',
    data: { id },
    header: { 'content-type': 'application/json' }
  });
}
// 批量查询一组场地在某天的所有预约
function getCourtReservations(court_ids, date) {
  return request({
    url: '/court_reservations',
    data: { court_ids, date }
  });
}

// 获取某类型下所有场地
function getCourtsByType(type_id) {
  return request({ url: '/courts', data: { type_id } });
}

// 获取禁用时间段映射
async function getDisabledSlots(date, courtId) {
  console.log('🔥 courtId 请求:', courtId);
  try {
    const data = await request({
      url: '/disabled_slots',
      method: 'GET',
      data: { date, courtId }
    });
    console.log('🔥 预约记录:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return { data: {}, error };
  }
}

module.exports = {
  getVenues,
  getCourtTypes,
  getCourts,
  getCourtDetail,
  getReservations,
  createReservation,
  cancelReservation,
  getCourtReservations,
  getCourtsByType,
  getDisabledSlots,
};