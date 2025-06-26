/**
 * @fileoverview 微信小程序前端统一日志工具，兼容 console，便于后续接入后端日志收集。
 * 仅在开发环境下输出详细日志，生产环境可扩展为上报日志。
 */
const logger = {
    info(...args) {
      console.info('[INFO]', ...args);
    },
    warn(...args) {
      console.warn('[WARN]', ...args);
    },
    error(...args) {
      console.error('[ERROR]', ...args);
    }
  };
  module.exports = logger;