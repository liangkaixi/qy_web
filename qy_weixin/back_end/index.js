const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
// TODO: 替换为你的 Supabase 项目地址和 service_role 密钥
const SUPABASE_URL = 'https://supabase.luxilive.cn';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// 1. 场馆列表
app.get('/api/venues', async (req, res) => {
  const { data, error } = await supabase
    .from('qy_venues')
    .select('id, name, address, description, cover_image, status')
    .order('name', { ascending: true });
  if (error) return res.status(500).json({ code: 1, msg: '数据库查询失败', error });
  res.json({ code: 0, data });
});

// 2. 场地列表（支持 venue_id 和 type_id 任意组合过滤）
app.get('/api/courts', async (req, res) => {
  const { venue_id, type_id } = req.query;
  let query = supabase
    .from('qy_courts')
    .select('id, name, area, image, resource_key, resource_group, area_type, status, type_id, venue_id');
  if (venue_id) query = query.eq('venue_id', venue_id);
  if (type_id) query = query.eq('type_id', type_id);
  const { data, error } = await query.order('name', { ascending: true });
  if (error) return res.status(500).json({ code: 1, msg: '数据库查询失败', error });
  res.json({ code: 0, data });
});

// 3. 场地详情
app.get('/api/court_detail', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ code: 1, msg: '缺少id' });
  const { data, error } = await supabase
    .from('qy_courts')
    .select('*, qy_court_images(url, sort)')
    .eq('id', id)
    .single();
  if (error) return res.status(500).json({ code: 1, msg: '数据库查询失败', error });
  res.json({ code: 0, data });
});

// 4. 我的预约列表
app.get('/api/reservations', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ code: 1, msg: '缺少user_id' });
  const { data, error } = await supabase
    .from('qy_court_reservations')
    .select('id, court_id, date, start_time, duration, price, phone, status, created_at')
    .eq('phone', user_id) // 这里假设用手机号做唯一标识，如用supabase用户id请调整
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ code: 1, msg: '数据库查询失败', error });
  res.json({ code: 0, data });
});

// 5. 新建预约
app.post('/api/reservations', async (req, res) => {
  const { court_id, date, start_time, duration, price, phone } = req.body;
  if (!court_id || !date || !start_time || !duration || price === undefined || !phone) {
    return res.status(400).json({ code: 1, msg: '参数不完整' });
  }
  const { data, error } = await supabase
    .from('qy_court_reservations')
    .insert([{ court_id, date, start_time, duration, price, phone, status: 'reserved' }])
    .select()
    .single();
  if (error) return res.status(500).json({ code: 1, msg: '预约失败', error });
  res.json({ code: 0, data });
});

// 6. 取消预约
app.post('/api/reservations/cancel', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ code: 1, msg: '缺少预约id' });
  const { data, error } = await supabase
    .from('qy_court_reservations')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ code: 1, msg: '取消失败', error });
  res.json({ code: 0, data });
});

// 7. 场地类型列表
app.get('/api/court_types', async (req, res) => {
  const { data, error } = await supabase
    .from('qy_court_types')
    .select('id, name, icon')
    .order('name', { ascending: true });
  if (error) return res.status(500).json({ code: 1, msg: '数据库查询失败', error });
  res.json({ code: 0, data });
});

//8 查询某场地或一组场地在某天的所有预约
app.get('/api/court_reservations', async (req, res) => {
  const { court_id, court_ids, date } = req.query;
  if ((!court_id && !court_ids) || !date) {
    return res.status(400).json({ code: 1, msg: '缺少court_id(s)或date' });
  }
  let query = supabase
    .from('qy_court_reservations')
    .select('*')
    .eq('date', date);

  if (court_ids) {
    const ids = court_ids.split(',').map(id => id.trim()).filter(Boolean);
    if (!ids.length) {
      return res.status(400).json({ code: 1, msg: 'court_ids参数无效' });
    }
    query = query.in('court_id', ids);
  } else if (court_id) {
    query = query.eq('court_id', court_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ code: 1, msg: '数据库查询失败', error });
  res.json({ code: 0, data });
});

//9 // 工具函数：获取所有与当前分区互斥的分区id（含自己，双向）
async function getConflictCourtIds(courtId) {
  const cleanCourtId = String(courtId).trim();
  // 正向
  const { data: conflicts, error } = await supabase
    .from('qy_court_conflicts')
    .select('court_id,conflict_court_id')
    .eq('court_id', cleanCourtId);
  if (error) throw error;
  // 反向
  const { data: reverseConflicts, error: revErr } = await supabase
    .from('qy_court_conflicts')
    .select('court_id,conflict_court_id')
    .eq('conflict_court_id', cleanCourtId);
  if (revErr) throw revErr;
  const ids = [
    cleanCourtId,
    ...conflicts.map((c) => c.conflict_court_id),
    ...reverseConflicts.map((c) => c.court_id),
  ];
  return Array.from(new Set(ids));
}

// 聚合API：返回所有分区的禁用时间段
app.get('/api/disabled_slots', async (req, res) => {
  const { date, courtId } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required' });

  // 只查相关分区
  let courtIdsToQuery = [];
  if (courtId) {
    try {
      courtIdsToQuery = await getConflictCourtIds(courtId); // 自己+互斥
    } catch (err) {
      return res.status(500).json({ error: '获取互斥场地失败', detail: err.message });
    }
  }

  let query = supabase
    .from('qy_court_reservations')
    .select('*')
    .eq('date', date);
  if (courtIdsToQuery.length > 0) {
    query = query.in('court_id', courtIdsToQuery);
  }

  const { data: allReservations, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // 构建禁用映射
  const allRelatedIdsArr = await Promise.all(
    allReservations.map(r => getConflictCourtIds(r.court_id))
  );
  const disableMap = {};
  for (let i = 0; i < allReservations.length; i++) {
    const r = allReservations[i];
    const relatedIds = allRelatedIdsArr[i];
    const rStart = parseInt(r.start_time.slice(0, 2)) * 60 + parseInt(r.start_time.slice(3, 5));
    const rEnd = rStart + (r.duration || 60);
    for (const id of relatedIds) {
      if (!disableMap[id]) disableMap[id] = [];
      disableMap[id].push({ start: rStart, end: rEnd });
    }
  }

  // 只返回相关项
  if (courtId) {
    const filtered = {};
    for (const id of courtIdsToQuery) {
      if (disableMap[id]) filtered[id] = disableMap[id];
    }
    return res.json(filtered);
  }

  // 否则返回全部
  res.json(disableMap);
});

app.post('/api/onLogin', async (req, res) => {
  const { code, userInfo } = req.body;

  if (!code) {
    return res.status(400).json({ code: 1, msg: '缺少 code' });
  }

  try {
    // 请求微信 openid
    const { data: wxData } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: 'wx06d12d09f39a5a57',
        secret: '1a42baf7fa87844100b6aa0934601678',
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = wxData;
    if (!openid) {
      return res.status(500).json({ code: 1, msg: '获取 openid 失败', error: { errcode, errmsg } });
    }

    const {
      nickName: nickname,
      avatarUrl,
      gender,
      city,
      province,
      country
    } = userInfo || {};

    // 插入或更新用户数据
    const { data, error } = await supabase
      .from('qy_users')
      .upsert({
        openid,
        nickname,
        avatar_url: avatarUrl,
        gender,
        city,
        province,
        country
      }, { onConflict: 'openid' })  // 确保更新而不是插入重复
      .select()
      .single();

    if (error) {
      return res.status(500).json({ code: 1, msg: '数据库保存失败', error });
    }

    res.json({ code: 0, data: { openid, user: data } });
  } catch (err) {
    console.error('登录异常:', err);
    res.status(500).json({ code: 1, msg: '登录失败', error: err.message });
  }
});



const port = process.env.PORT || 8000;
app.listen(port, '0.0.0.0', () => {  // 确保是0.0.0.0而非localhost
  console.log(`API server running at http://0.0.0.0:${port}`);
});
