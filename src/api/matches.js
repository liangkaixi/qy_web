import supabase from '../supabase';
import logger from './logger';

/**
 * 查询赛事列表，支持类型筛选，联表场馆、场地、发布者信息，并统计报名人数
 * @param {string} sportType 运动类型，可选
 * @returns {Promise<Array>} 赛事列表
 */
export async function getMatchesWithDetails(sportType = '') {
  logger.info('Fetching matches', { sportType });
  let query = supabase
    .from('qy_matches')
    .select(`*,
      qy_venues:venue_id(name),
      qy_courts:court_id(name),
      creator:creator_id(nickname,avatar_url)
    `)
    .order('match_time', { ascending: false });
  if (sportType) {
    query = query.eq('sport_type', sportType);
  }
  const { data: matches, error } = await query;
  console.log('原始赛事数据:', matches);
  if (matches && matches.length) {
    matches.forEach(m => console.log('creator字段:', m.creator));
  }
  if (error) {
    logger.error('Failed to fetch matches', { error });
    throw error;
  }
  // 查询报名人数
  const matchIds = matches.map(m => m.id);
  let signupCounts = {};
  if (matchIds.length > 0) {
    const { data: signups, error: signupError } = await supabase
      .from('qy_match_signups')
      .select('match_id, id')
      .in('match_id', matchIds);
    if (signupError) {
      logger.error('Failed to fetch match signups', { signupError });
    } else {
      signupCounts = signups.reduce((acc, cur) => {
        acc[cur.match_id] = (acc[cur.match_id] || 0) + 1;
        return acc;
      }, {});
    }
  }
  // 整理返回
  return matches.map(m => ({
    id: m.id,
    title: m.title || '',
    sport_type: m.sport_type,
    match_time: m.match_time,
    status: m.status,
    venue_name: m.qy_venues?.name || '',
    court_name: m.qy_courts?.name || '',
    signup_count: signupCounts[m.id] || 0,
    creator_nickname: m.creator?.nickname || '匿名',
    creator_avatar: m.creator?.avatar_url || ''
  }));
} 