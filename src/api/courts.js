// 获取指定场馆下的场地
import supabase from '../supabase';
import logger from './logger';

/**
 * 获取指定场馆下的所有场地
 * @param {string} venueId
 */
export async function getCourtsByVenue(venueId) {
  logger.info('Fetching courts for venue', { venueId });
  const { data, error } = await supabase
    .from('qy_courts')
    .select('*')
    .eq('venue_id', venueId)
    .order('name');
  if (error) {
    logger.error('Failed to fetch courts', { error });
    throw error;
  }
  return data;
}
