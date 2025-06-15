<template>
  <div class="reserve-form-page">
    <h1>篮球定场地预约</h1>
    <form class="reserve-form" @submit.prevent="onReserve">
      <div class="form-row">
        <label>选择日期：</label>
        <input type="date" v-model="date" :min="today" required />
      </div>
      <div class="form-row">
        <label>选择场地类型：</label>
        <div class="area-group">
          <button v-for="area in areaOptions" :key="area" type="button"
            :class="['area-btn', { active: selectedArea === area }]"
            @click="selectedArea = area">{{ area }}</button>
        </div>
      </div>
      <div class="form-row">
        <label>选择开始时间：</label>
        <select v-model="startTime" required>
          <option
            v-for="t in timeOptions"
            :key="t"
            :value="t"
            :disabled="reservedSlots.includes(t)"
          >{{ t }}<span v-if="reservedSlots.includes(t)">（已约）</span></option>
        </select>
      </div>
      <div class="form-row">
        <label>选择时长：</label>
        <select v-model="duration" required>
          <option v-for="d in durationOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
      </div>
      <div class="form-row">
        <label>手机号：</label>
        <input v-model="phone" type="tel" maxlength="11" placeholder="请输入手机号" required />
      </div>
      <div class="form-row price-row">
        <span>价格：<b>{{ price }}</b> 元</span>
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="loading">提交预约</button>
      </div>
      <div v-if="error" class="form-error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import supabase from '../supabase'

// 假设场地静态定义，实际可从数据库获取
const courts = [
  { id: 'b1', area: '半场A', name: '1号场地' },
  { id: 'b2', area: '半场B', name: '1号场地' },
  { id: 'b3', area: '全场', name: '1号场地' }
]
const today = new Date().toISOString().slice(0, 10)
const date = ref(today)
const areaOptions = ['半场A', '半场B', '全场']
const selectedArea = ref('半场A')

// 生成 6:30~21:30 每半小时时间段
function genTimeOptions() {
  const arr = []
  let hour = 6, min = 30
  while (hour < 22) {
    arr.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
    min += 30
    if (min === 60) { hour++; min = 0 }
  }
  return arr
}
const timeOptions = genTimeOptions()
const startTime = ref(timeOptions[0])

const durationOptions = [
  { value: 1, label: '1小时' },
  { value: 2, label: '2小时' },
  { value: 3, label: '3小时' },
  { value: 4, label: '半天(4小时)' },
  { value: 8, label: '全天(8小时)' },
]
const duration = ref(1)
const phone = ref('')
const price = computed(() => 20 * duration.value)
const error = ref('')
const loading = ref(false)
const reservedSlots = ref([])

// 查询已被预约的时间段
async function fetchReservedSlots() {
  error.value = ''
  reservedSlots.value = []
  // 互斥规则：全场查所有半场，半场查全场和自身
  let relatedCourtIds = []
  if (selectedArea.value === '全场') {
    relatedCourtIds = courts.filter(c => c.area !== '全场').map(c => c.id)
  } else {
    relatedCourtIds = courts.filter(c => c.area === '全场' || c.area === selectedArea.value).map(c => c.id)
  }
  const { data, error: fetchErr } = await supabase
    .from('qy_court_reservations')
    .select('start_time, status')
    .in('court_id', relatedCourtIds)
    .eq('date', date.value)
  if (!fetchErr && data) {
    reservedSlots.value = data
      .filter(r => r.status === 'reserved' || r.status === 'confirmed')
      .map(r => r.start_time)
  }
}

watch([date, selectedArea], fetchReservedSlots, { immediate: true })

async function onReserve() {
  error.value = ''
  loading.value = true
  // 再次校验手机号
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    error.value = '请输入有效的手机号'
    loading.value = false
    return
  }
  // 再次校验时间段是否被占用
  await fetchReservedSlots()
  if (reservedSlots.value.includes(startTime.value)) {
    error.value = '该时间段已被预约，请选择其他时间'
    loading.value = false
    return
  }
  // 获取当前选择的场地id
  const court = courts.find(c => c.area === selectedArea.value)
  if (!court) {
    error.value = '场地信息有误'
    loading.value = false
    return
  }
  // 写入 supabase
  const { error: insertErr } = await supabase
    .from('qy_court_reservations')
    .insert({
      court_id: court.id,
      date: date.value,
      start_time: startTime.value,
      duration: duration.value,
      price: price.value,
      phone: phone.value,
      status: 'reserved',
    })
  loading.value = false
  if (insertErr) {
    error.value = '预约失败，请稍后重试'
    return
  }
  alert('预约成功！')
  // 可重置表单或跳转
}
</script>

<style scoped>
.reserve-form-page {
  max-width: 480px;
  margin: 48px auto 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem 2rem 2rem;
}
h1 {
  color: #1a73e8;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
}
.reserve-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.area-group {
  display: flex;
  gap: 1rem;
}
.area-btn {
  padding: 0.5rem 1.2rem;
  border: 1.5px solid #1a73e8;
  background: #fff;
  color: #1a73e8;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.area-btn.active, .area-btn:hover {
  background: #e3eefe;
  color: #1761c6;
}
input, select {
  padding: 0.5rem 0.7rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}
.price-row {
  text-align: right;
  color: #1a73e8;
  font-size: 1.1rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
}
button[type="submit"] {
  padding: 0.7rem 2.2rem;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
button[type="submit"]:hover {
  background: #1761c6;
}
.form-error {
  color: #e53935;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.98rem;
}
@media (max-width: 600px) {
  .reserve-form-page {
    padding: 1.2rem 0.5rem 0.7rem 0.5rem;
    min-width: 0;
  }
  h1 {
    font-size: 1.1rem;
  }
}
</style>
