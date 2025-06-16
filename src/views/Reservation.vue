<template>
  <div class="reservation-container">
    <h2 class="sport-title">场地预约</h2>
    <!-- 类型选择：按钮组 -->
    <div class="type-btn-group">
      <button
        v-for="type in courtTypes"
        :key="type.id"
        :class="['type-btn', { active: courtTypeId === type.id }]"
        @click="selectType(type.id)"
        type="button"
      >
        <span class="type-icon" v-if="type.name.includes('篮球')">🏀</span>
        <span class="type-icon" v-else-if="type.name.includes('羽毛球')"
          >🏸</span
        >
        <span class="type-icon" v-else-if="type.name.includes('气排球')"
          >🏐</span
        >
        {{ type.name }}
      </button>
    </div>
    <!-- 分区选择：仅篮球显示全场/半场 -->
    <div class="area-btn-group" v-if="showAreaType">
      <button
        v-for="area in areaTypes"
        :key="area.value"
        :class="['area-btn', { active: areaType === area.value }]"
        @click="selectArea(area.value)"
        type="button"
      >
        {{ area.label }}
      </button>
    </div>
    <!-- 场地选择：按钮组，仅在满足条件时显示 -->
    <div
      class="court-btn-group"
      v-if="showCourtSelect && filteredCourts.length"
    >
      <button
        v-for="court in filteredCourts"
        :key="court.id"
        :class="['court-btn', { active: courtId === court.id }]"
        @click="selectCourt(court.id)"
        type="button"
        :title="
          court.resource_key && court.resource_group
            ? `${court.resource_key}@${court.resource_group}`
            : ''
        "
      >
        {{ court.name }}
      </button>
    </div>
    <!-- 日期选择：下拉框 -->
    <div class="date-select-group">
      <select v-model="date" class="date-select">
        <option v-for="d in dateOptions" :key="d.value" :value="d.value">
          {{ d.label }}
        </option>
      </select>
    </div>
    <!-- 时间段展示 -->
    <div class="slots-grid" v-if="availableSlots.length">
      <button
        v-for="slot in availableSlots"
        :key="slot.value"
        :disabled="slot.disabled"
        :class="[
          'slot-btn',
          { reserved: slot.disabled, active: startTime === slot.value },
        ]"
        @click="selectSlot(slot.value)"
        type="button"
      >
        {{ slot.label }}
      </button>
    </div>
    <!-- 时长选择 -->
    <div class="duration-btn-group" v-if="startTime">
      <button
        v-for="d in durations"
        :key="d"
        :class="['duration-btn', { active: duration === d }]"
        @click="selectDuration(d)"
        type="button"
      >
        {{ d }}小时
      </button>
    </div>
    <!-- 手机号 -->
    <input
      type="text"
      v-model="phone"
      placeholder="手机号"
      class="phone-input"
    />
    <button class="submit-btn" @click="submitReservation" :disabled="loading">
      预约
    </button>
    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getCourtTypes } from "@/api/courtTypes";
import {
  getReservationsByCourtAndDate,
  createReservation,
} from "@/api/reservations";
import logger from "@/api/logger";
import { isTimeConflict } from "@/utils/time";
import supabase from "@/supabase";

// 响应式变量定义
const message = ref("");
const errorMsg = ref("");
const courtTypes = ref([]);
const courts = ref([]);
const filteredCourts = ref([]);
const areaTypes = [
  { label: "全场", value: "full" },
  { label: "半场", value: "part" },
];
const durations = [1, 2, 3];
const courtTypeId = ref("");
const areaType = ref("");
const courtId = ref("");
const date = ref("");
const dateOptions = ref([]);
const startTime = ref("");
const duration = ref(1);
const phone = ref("");
const loading = ref(false);
const reservations = ref([]);
const availableSlots = ref([]);
import { watch } from "vue";
watch(date, (newVal, oldVal) => {
  if (courtId.value) {
    fetchReservations();
  }
});
const basketballTypeId = computed(() => {
  const basketball = courtTypes.value.find(
    (t) => t.name && t.name.includes("篮球")
  );
  return basketball ? basketball.id : "";
});
const showAreaType = computed(
  () => courtTypeId.value === basketballTypeId.value
);
const showCourtSelect = computed(() => {
  if (courtTypeId.value === basketballTypeId.value) {
    return !!areaType.value;
  }
  return !!courtTypeId.value;
});

onMounted(() => {
  fetchCourtTypes();
  setDateOptions();
});

function setDateOptions() {
  const today = new Date();
  dateOptions.value = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      label: `${d.getMonth() + 1}月${d.getDate()}日${i === 0 ? " (今天)" : ""}`,
      value: d.toISOString().slice(0, 10),
    };
  });
  date.value = dateOptions.value[0].value;
}

async function fetchCourtTypes() {
  try {
    courtTypes.value = (await getCourtTypes()) || [];
    errorMsg.value = "";
  } catch (e) {
    errorMsg.value = "场地类型加载失败";
    courtTypes.value = [];
  }
}

async function fetchCourtsByTypeAndArea() {
  courtId.value = "";
  filteredCourts.value = [];
  if (!courtTypeId.value) return;
  let query = supabase
    .from("qy_courts")
    .select("*")
    .eq("type_id", courtTypeId.value);
  if (showAreaType.value && areaType.value) {
    query = query.eq("area_type", areaType.value);
  } else if (showAreaType.value && !areaType.value) {
    filteredCourts.value = [];
    return;
  }
  const { data, error } = await query.order("name");
  if (error) {
    errorMsg.value = "获取场地失败";
    logger.error("Failed to fetch courts by type/area", { error });
    filteredCourts.value = [];
    return;
  }
  filteredCourts.value = data || [];
}

// 获取当天所有预约（查所有分区，支持跨类型互斥）
async function fetchAllReservationsForDate() {
  if (!date.value) return [];
  const { data, error } = await supabase
    .from("qy_court_reservations")
    .select("*")
    .eq("date", date.value);
  if (error) {
    logger.error("Failed to fetch all reservations", { error });
    return [];
  }
  return data || [];
}

// 获取所有与当前分区互斥的分区id（含自己，双向）
async function getConflictCourtIds(courtId) {
  const cleanCourtId = String(courtId).trim();
  console.log(
    "getConflictCourtIds input courtId:",
    cleanCourtId,
    typeof cleanCourtId
  );
  // 全表打印
  const { data: allConflicts, error: allErr } = await supabase
    .from("qy_court_conflicts")
    .select("*");
  console.log("ALL qy_court_conflicts:", allConflicts);
  // 本地 filter 调试
  const filtered = (allConflicts || []).filter(
    (c) => c.court_id === cleanCourtId
  );
  console.log("Filtered conflicts:", filtered);
  // 查找所有与当前分区互斥的分区（正向）
  const { data: conflicts, error } = await supabase
    .from("qy_court_conflicts")
    .select("court_id,conflict_court_id")
    .eq("court_id", cleanCourtId);
  console.log("conflicts for", cleanCourtId, conflicts);
  if (error) throw error;
  // 反查：如果有对称互斥（B->A），也查出来
  const { data: reverseConflicts, error: revErr } = await supabase
    .from("qy_court_conflicts")
    .select("court_id,conflict_court_id")
    .eq("conflict_court_id", cleanCourtId);
  console.log("reverseConflicts for", cleanCourtId, reverseConflicts);
  if (revErr) throw revErr;
  // 合并所有互斥分区id + 自己
  const ids = [
    cleanCourtId,
    ...conflicts.map((c) => c.conflict_court_id),
    ...reverseConflicts.map((c) => c.court_id),
  ];
  console.log("getConflictCourtIds result for", cleanCourtId, "=>", ids);
  return Array.from(new Set(ids));
}

// 全局物理互斥预约冲突检测逻辑
async function fetchReservations() {
  if (!courtId.value || !date.value) return;
  try {
    // 1. 查当天所有预约
    const allReservations = await fetchAllReservationsForDate();
    // 2. 获取所有已预约分区 id
    const allReservedCourtIds = allReservations.map((r) => r.court_id);
    if (allReservedCourtIds.length === 0) {
      reservations.value = [];
      errorMsg.value = "";
      updateAvailableSlots();
      return;
    }
    // 3. 查所有这些分区的互斥分区 id（双向）
    const { data: conflicts, error: conflictErr } = await supabase
      .from("qy_court_conflicts")
      .select("court_id, conflict_court_id")
      .or(
        `court_id.in.(${allReservedCourtIds.join(
          ","
        )}),conflict_court_id.in.(${allReservedCourtIds.join(",")})`
      );
    if (conflictErr) {
      logger.error("Failed to fetch court conflicts", { conflictErr });
      reservations.value = allReservations;
      errorMsg.value = "";
      updateAvailableSlots();
      return;
    }
    // 4. 合并所有互斥分区 id + 自己
    const allConflictIds = new Set(allReservedCourtIds);
    conflicts.forEach((c) => {
      allConflictIds.add(c.court_id);
      allConflictIds.add(c.conflict_court_id);
    });
    // 5. 用这些 id 过滤出所有相关预约
    const relevantReservations = allReservations.filter((r) =>
      allConflictIds.has(r.court_id)
    );
    reservations.value = relevantReservations;
    errorMsg.value = "";
    updateAvailableSlots();
  } catch (e) {
    reservations.value = [];
    updateAvailableSlots();
    errorMsg.value = "预约信息获取失败";
    console.error("fetchReservations error:", e);
  }
}

// 全局禁用映射实现，确保物理互斥100%准确（加日志+并发优化）
async function updateAvailableSlots() {
  if (!courtId.value) {
    availableSlots.value = [];
    return;
  }
  // 1. 查询当天所有预约（已缓存到 reservations.value）
  const allReservations = reservations.value;
  console.log("allReservations", allReservations);
  // 2. 并发查所有互斥分区
  const allRelatedIdsArr = await Promise.all(
    allReservations.map((r) => getConflictCourtIds(r.court_id))
  );
  // 3. 构建禁用映射：{ courtId: [{start, end}] }
  const disableMap = {};
  for (let i = 0; i < allReservations.length; i++) {
    const r = allReservations[i];
    const relatedIds = allRelatedIdsArr[i];
    console.log("getConflictCourtIds for", r.court_id, "=>", relatedIds);
    const rStart =
      parseInt(r.start_time.slice(0, 2)) * 60 +
      parseInt(r.start_time.slice(3, 5));
    const rEnd = rStart + (r.duration || 60);
    for (const id of relatedIds) {
      if (!disableMap[id]) disableMap[id] = [];
      disableMap[id].push({ start: rStart, end: rEnd });
    }
  }
  console.log("disableMap", disableMap);
  // 4. 渲染当前分区的时间格
  const currentId = courtId.value;
  console.log("currentId", currentId);
  const slots = [];
  for (let h = 8; h < 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:00`;
      const slotStart = h * 60 + m;
      const slotEnd = slotStart + 30;
      const disabled = (disableMap[currentId] || []).some(
        ({ start, end }) => Math.max(slotStart, start) < Math.min(slotEnd, end)
      );
      slots.push({
        label: `${h}:${m === 0 ? "00" : m}`,
        value: time,
        disabled,
      });
    }
  }
  availableSlots.value = slots;
}

function selectType(id) {
  courtTypeId.value = id;
  areaType.value = "";
  courtId.value = "";
  filteredCourts.value = [];
  startTime.value = "";
  duration.value = 1;
  fetchCourtsByTypeAndArea();
}
function selectArea(val) {
  areaType.value = val;
  courtId.value = "";
  filteredCourts.value = [];
  startTime.value = "";
  duration.value = 1;
  fetchCourtsByTypeAndArea();
}
function selectDate(val) {
  date.value = val;
  courtId.value && fetchReservations();
}
function selectCourt(id) {
  courtId.value = id;
  startTime.value = "";
  duration.value = 1;
  fetchReservations();
}
function selectSlot(val) {
  startTime.value = val;
  duration.value = 1;
}
function selectDuration(d) {
  duration.value = d;
  updateAvailableSlots();
}

async function submitReservation() {
  if (!courtId.value || !startTime.value || !duration.value || !phone.value) {
    message.value = "请完整填写信息";
    return;
  }
  loading.value = true;
  message.value = "";
  try {
    await createReservation({
      court_id: courtId.value,
      date: date.value,
      start_time: startTime.value,
      duration: duration.value * 60,
      price: 0,
      phone: phone.value,
      status: "reserved",
    });
    message.value = "预约成功！";
    errorMsg.value = "";
    logger.info("Reservation submitted", {
      courtId: courtId.value,
      date: date.value,
      startTime: startTime.value,
    });
    fetchReservations();
  } catch (e) {
    message.value = e.message || "预约失败";
    errorMsg.value = e.message || "预约失败";
    logger.error("Reservation failed", { error: e });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.reservation-container {
  max-width: 540px;
  margin: 48px auto 0;
  padding: 32px 20px 28px 20px;
  background: linear-gradient(135deg, #f5fafd 60%, #e0f7fa 100%);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(64, 158, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sport-title {
  font-size: 2rem;
  font-weight: 800;
  color: #222;
  letter-spacing: 2px;
  margin-bottom: 28px;
  text-align: center;
  text-shadow: 0 2px 8px #e0ecff;
}
.type-btn-group,
.area-btn-group,
.court-btn-group,
.duration-btn-group {
  display: flex;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
  justify-content: center;
}
.date-select-group {
  width: 100%;
  margin-bottom: 18px;
  display: flex;
  justify-content: center;
}
.date-select {
  width: 220px;
  padding: 10px 16px;
  border-radius: 14px;
  border: 2px solid #b2ebf2;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(90deg, #e3f2fd 60%, #b2ebf2 100%);
  color: #222;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
  transition: border 0.2s;
  outline: none;
}
.date-select:focus {
  border: 2px solid #409eff;
}
.type-btn,
.area-btn,
.court-btn,
.duration-btn,
.submit-btn,
.slot-btn {
  min-width: 110px;
  padding: 12px 0;
  border: none;
  border-radius: 18px;
  background: linear-gradient(90deg, #e3f2fd 60%, #b2ebf2 100%);
  color: #222;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, color 0.2s, transform 0.1s;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
  position: relative;
}
.type-btn.active,
.area-btn.active,
.court-btn.active,
.duration-btn.active,
.submit-btn:active,
.slot-btn.active {
  background: linear-gradient(90deg, #409eff 60%, #67c23a 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.18);
  transform: scale(1.08);
}
.type-btn:hover,
.area-btn:hover,
.court-btn:hover,
.duration-btn:hover,
.submit-btn:hover,
.slot-btn:hover {
  background: linear-gradient(90deg, #b2ebf2 60%, #e3f2fd 100%);
  color: #222;
}
.type-icon {
  margin-right: 6px;
  font-size: 1.2em;
}
.court-btn .court-sub {
  display: none;
}
.court-btn .court-group {
  display: none;
}
.slots-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
  justify-content: center;
}
.slot-btn {
  min-width: 70px;
  padding: 10px 0;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0f7fa 60%, #b2ebf2 100%);
  color: #222;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.1s;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
}
.slot-btn.active {
  background: linear-gradient(90deg, #ff9800 60%, #409eff 100%);
  color: #fff;
  transform: scale(1.08);
}
.slot-btn.reserved,
.slot-btn:disabled {
  background: #ececec;
  color: #bbb;
  cursor: not-allowed;
  text-decoration: line-through;
}
.phone-input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  margin-bottom: 18px;
  font-size: 1.1rem;
  transition: border 0.2s;
}
.phone-input:focus {
  border: 2px solid #409eff;
  outline: none;
}
.submit-btn {
  width: 100%;
  background: linear-gradient(90deg, #409eff 60%, #67c23a 100%);
  color: #fff;
  border: none;
  border-radius: 18px;
  padding: 14px;
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
}
.submit-btn:hover {
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.18);
  background: linear-gradient(90deg, #67c23a 60%, #409eff 100%);
}
.message {
  margin-top: 18px;
  color: #f56c6c;
  font-size: 1.1rem;
  text-align: center;
  font-weight: 700;
}
.error-msg {
  margin-top: 12px;
  color: #ff9800;
  font-size: 1rem;
  text-align: center;
  font-weight: 700;
}
@media (max-width: 600px) {
  .reservation-container {
    padding: 12px 2vw 18px 2vw;
    border-radius: 12px;
  }
  .type-btn,
  .area-btn,
  .court-btn,
  .duration-btn,
  .submit-btn {
    min-width: 90px;
    font-size: 1rem;
    padding: 10px 0;
    border-radius: 12px;
  }
  .date-select {
    width: 98vw;
    min-width: 120px;
    font-size: 0.95rem;
    padding: 8px 0;
    border-radius: 10px;
  }
  .slots-grid {
    gap: 6px;
  }
  .slot-btn {
    min-width: 54px;
    font-size: 0.95rem;
    padding: 7px 0;
    border-radius: 8px;
  }
}
</style>
