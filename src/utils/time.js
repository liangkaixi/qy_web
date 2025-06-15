/**
 * 时间处理工具
 * @description 提供时间字符串与分钟数的互转、时间段冲突检测等
 */

/**
 * 将 "HH:mm:ss" 字符串转为分钟数
 */
export function timeStrToMinutes(str) {
  const [h, m] = str.split(':');
  return parseInt(h) * 60 + parseInt(m);
}

/**
 * 将分钟数转为 "HH:mm:ss" 字符串
 */
export function minutesToTimeStr(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}:00`;
}

/**
 * 判断两个时间段是否有重叠
 * @param {string} startA - "HH:mm:ss"
 * @param {number} durationA - 分钟
 * @param {string} startB - "HH:mm:ss"
 * @param {number} durationB - 分钟
 * @returns {boolean}
 */
export function isTimeConflict(startA, durationA, startB, durationB) {
  const a1 = timeStrToMinutes(startA);
  const a2 = a1 + durationA;
  const b1 = timeStrToMinutes(startB);
  const b2 = b1 + durationB;
  return Math.max(a1, b1) < Math.min(a2, b2);
}
