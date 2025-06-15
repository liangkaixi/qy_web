// 获取场地类型列表
import supabase from '../supabase';
import logger from './logger';

/**
 * 获取所有场地类型
 */
export async function getCourtTypes() {
  logger.info('Fetching all court types');
  const { data, error } = await supabase.from('qy_court_types').select('*').order('name');
  if (error) {
    logger.error('Failed to fetch court types', { error });
    throw error;
  }
  return data;
}
