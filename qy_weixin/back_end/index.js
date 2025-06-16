const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// TODO: 替换为你的 Supabase 项目地址和 service_role 密钥
const SUPABASE_URL = 'https://supabase.luxilive.cn';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey AgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';
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
  // 获取北京时间
  function getBeijingTime() {
    const now = new Date();
    const offset = 8 * 60; // 8小时*60分钟
    const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
    const y = local.getFullYear();
    const m = (local.getMonth() + 1).toString().padStart(2, '0');
    const d = local.getDate().toString().padStart(2, '0');
    const h = local.getHours().toString().padStart(2, '0');
    const min = local.getMinutes().toString().padStart(2, '0');
    const s = local.getSeconds().toString().padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  }
  const created_at = getBeijingTime();
  const { data, error } = await supabase
    .from('qy_court_reservations')
    .insert([{ court_id, date, start_time, duration, price, phone, status: 'reserved', created_at }])
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

// 查询某场地或一组场地在某天的所有预约
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
const port = process.env.PORT || 8000;
app.listen(port, '0.0.0.0', () => {  // 确保是0.0.0.0而非localhost
  console.log(`API server running at http://0.0.0.0:${port}`);
});
