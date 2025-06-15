// 预约相关接口
import supabase from '../supabase';
import logger from './logger';
import { isTimeConflict } from '../utils/time';

/**
 * 查询某场地某天的所有预约
 * @param {string} courtId
 * @param {string} date - yyyy-mm-dd
 */
export async function getReservationsByCourtAndDate(courtId, date) {
  logger.info('Fetching reservations', { courtId, date });
  const { data, error } = await supabase
    .from('qy_court_reservations')
    .select('*')
    .eq('court_id', courtId)
    .eq('date', date)
    .order('start_time');
  if (error) {
    logger.error('Failed to fetch reservations', { error });
    throw error;
  }
  return data;
}

/**
 * 创建预约，自动检测时间冲突
 * @param {Object} reservation
 */
export async function createReservation(reservation) {
  logger.info('Attempting to create reservation', reservation);
  const { court_id, date, start_time, duration } = reservation;
  // 冲突检测
  const { data: existing, error: fetchError } = await supabase
    .from('qy_court_reservations')
    .select('*')
    .eq('court_id', court_id)
    .eq('date', date);
  if (fetchError) {
    logger.error('Failed to fetch existing reservations', { fetchError });
    throw fetchError;
  }
  const hasConflict = existing.some(r =>
    isTimeConflict(start_time, duration, r.start_time, r.duration)
  );
  if (hasConflict) {
    logger.warn('Reservation conflict detected', { reservation });
    throw new Error('该时间段已被预约');
  }
  // 插入预约
  const { data, error } = await supabase
    .from('qy_court_reservations')
    .insert([reservation])
    .select();
  if (error) {
    logger.error('Failed to create reservation', { error });
    throw error;
  }
  logger.info('Reservation created successfully', { data });
  return data[0];
}
