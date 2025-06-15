// 获取场馆列表
import supabase from '../supabase';
import logger from './logger';

/**
 * 获取所有场馆
 */
export async function getVenues() {
  logger.info('Fetching all venues');
  const { data, error } = await supabase.from('qy_venues').select('*').order('name');
  if (error) {
    logger.error('Failed to fetch venues', { error });
    throw error;
  }
  return data;
}
