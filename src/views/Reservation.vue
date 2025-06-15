<template>
  <div class="reservation-container">
    <h2 class="sport-title">场地预约</h2>
    <!-- 日期选择：下拉框（移到最前面） -->
    <div class="date-select-group">
      <select v-model="date" class="date-select">
        <option v-for="d in dateOptions" :key="d.value" :value="d.value">
          {{ d.label }}
        </option>
      </select>
    </div>

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
      <!-- 篮球/其他类型：一行平铺，羽毛球：两行 -->
      <template
        v-if="
          courtTypeId &&
          courtTypes.find(
            (t) => t.id === courtTypeId && t.name.includes('羽毛球')
          )
        "
      >
        <div
          v-for="(row, rowIdx) in displayCourts"
          :key="'row' + rowIdx"
          style="display: flex; gap: 16px; margin-bottom: 8px"
        >
          <button
            v-for="court in row"
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
      </template>
      <template v-else>
        <button
          v-for="court in displayCourts"
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
      </template>
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
    <!-- 时长选择：下拉框 -->
    <div class="duration-select-group" v-if="startTime">
      <select v-model="duration" class="duration-select">
        <option
          v-for="d in durations"
          :key="d"
          :value="d"
          :disabled="!availableDurations.includes(d)"
        >
          {{ d }}小时
        </option>
      </select>
    </div>
    <!-- 手机号 -->
    <input
      type="text"
      v-model="phone"
      placeholder="手机号"
      class="phone-input"
      @blur="onPhoneBlur"
    />
    <div v-if="phoneError" class="error-msg">{{ phoneError }}</div>
    <div v-if="conflictError" class="error-msg">{{ conflictError }}</div>
    <button
      class="submit-btn"
      @click="submitReservation"
      :disabled="loading || !phoneValid || !!conflictError"
    >
      预约
    </button>
    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
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
const durations = [1, 1.5, 2, 2.5, 3];
const availableDurations = ref([1]);
const courtTypeId = ref("");
const areaType = ref("");
const courtId = ref("");
const date = ref("");
const dateOptions = ref([]);
const startTime = ref("");
const duration = ref(1);
const phone = ref("");
const phoneValid = ref(false);
const phoneError = ref("");
const loading = ref(false);
const reservations = ref([]);
const availableSlots = ref([]);
const conflictError = ref("");

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

// 新增 courtMap 用于缓存相关场地信息
const courtMap = ref({});

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

// 优化后的预约冲突检测逻辑
async function fetchReservations() {
  if (!courtId.value || !date.value) return;
  // 查询当前场地的 resource_key、resource_group、area_type、type_id
  const { data: courtData, error: courtError } = await supabase
    .from("qy_courts")
    .select("resource_key, resource_group, area_type, type_id")
    .eq("id", courtId.value)
    .single();
  if (courtError || !courtData) {
    reservations.value = [];
    updateAvailableSlots();
    errorMsg.value = "场地信息获取失败";
    return;
  }
  let courtIds = [];
  let courtMapRaw = [];
  // 羽毛球类型特殊互斥处理
  const badmintonType = courtTypes.value.find(
    (t) => t.name && t.name.includes("羽毛球")
  );
  const basketballType = courtTypes.value.find(
    (t) => t.name && t.name.includes("篮球")
  );
  if (badmintonType && courtData.type_id === badmintonType.id) {
    // 1. 查全场（resource_group）下 area_type=full 的场地
    const { data: fullCourts, error: fullError } = await supabase
      .from("qy_courts")
      .select("id, area_type, type_id")
      .eq("resource_group", courtData.resource_group)
      .eq("area_type", "full");
    if (fullError) {
      reservations.value = [];
      updateAvailableSlots();
      errorMsg.value = "全场信息获取失败";
      return;
    }
    // 2. 查本分区（resource_key）下 area_type=part 且 type=篮球 的场地
    let partCourts = [];
    if (basketballType) {
      const { data: partData, error: partError } = await supabase
        .from("qy_courts")
        .select("id, area_type, type_id")
        .eq("resource_key", courtData.resource_key)
        .eq("area_type", "part")
        .eq("type_id", basketballType.id);
      if (partError) {
        reservations.value = [];
        updateAvailableSlots();
        errorMsg.value = "半场信息获取失败";
        return;
      }
      partCourts = partData || [];
    }
    // 只查全场/半场和本羽毛球场地
    courtMapRaw = [...(fullCourts || []), ...(partCourts || [])];
    const fullPartIds = courtMapRaw.map((c) => c.id);
    courtIds = [...fullPartIds, courtId.value];
    // 构建 courtMap
    courtMap.value = {};
    courtMapRaw.forEach((c) => {
      courtMap.value[c.id] = c;
    });
    // 也加上本羽毛球场地自身
    courtMap.value[courtId.value] = {
      id: courtId.value,
      area_type: courtData.area_type,
      type_id: courtData.type_id,
    };
  } else if (courtData.area_type === "full" && courtData.resource_group) {
    // 篮球全场：查 resource_group 下所有场地
    const { data: groupCourts, error: groupError } = await supabase
      .from("qy_courts")
      .select("id, area_type, type_id")
      .eq("resource_group", courtData.resource_group);
    if (groupError || !groupCourts) {
      reservations.value = [];
      updateAvailableSlots();
      errorMsg.value = "全场分组场地信息获取失败";
      return;
    }
    courtIds = groupCourts.map((c) => c.id);
    courtMap.value = {};
    (groupCourts || []).forEach((c) => {
      courtMap.value[c.id] = c;
    });
  } else if (courtData.resource_key) {
    // 分区：查 resource_key 下所有场地
    const { data: keyCourts, error: keyError } = await supabase
      .from("qy_courts")
      .select("id, area_type, type_id")
      .eq("resource_key", courtData.resource_key);
    if (keyError || !keyCourts) {
      reservations.value = [];
      updateAvailableSlots();
      errorMsg.value = "分区场地信息获取失败";
      return;
    }
    courtIds = keyCourts.map((c) => c.id);
    courtMap.value = {};
    (keyCourts || []).forEach((c) => {
      courtMap.value[c.id] = c;
    });
  } else {
    // fallback: 只查当前场地
    courtIds = [courtId.value];
    courtMap.value = {};
  }
  // 查找所有相关场地的预约
  const { data: allReservations, error: reservationsError } = await supabase
    .from("qy_court_reservations")
    .select("*", { count: "exact" })
    .in("court_id", courtIds)
    .eq("date", date.value);
  if (reservationsError || !allReservations) {
    reservations.value = [];
    updateAvailableSlots();
    errorMsg.value = "预约信息获取失败";
    return;
  }
  reservations.value = allReservations || [];
  errorMsg.value = "";
  updateAvailableSlots();
}

function checkCurrentConflict() {
  if (!startTime.value || !duration.value) {
    conflictError.value = "";
    return false;
  }
  // 检查当前选择的时间段是否与已有预约冲突
  let hasConflict = false;
  const slotDuration = duration.value * 60;
  if (isBadmintonCourt()) {
    // 全场/半场冲突
    const fullOrPartReservations = reservations.value.filter((r) => {
      const court = courtMap.value[r.court_id];
      if (!court) return false;
      return court.area_type === "full" || court.area_type === "part";
    });
    const selfReservations = reservations.value.filter(
      (r) => r.court_id === courtId.value
    );
    hasConflict =
      fullOrPartReservations.some((r) =>
        isTimeConflict(startTime.value, slotDuration, r.start_time, r.duration)
      ) ||
      selfReservations.some((r) =>
        isTimeConflict(startTime.value, slotDuration, r.start_time, r.duration)
      );
  } else {
    hasConflict = reservations.value.some((r) =>
      isTimeConflict(startTime.value, slotDuration, r.start_time, r.duration)
    );
  }
  conflictError.value = hasConflict ? "该时间段不可预约" : "";
  return hasConflict;
}

function isBadmintonCourt() {
  const badmintonType = courtTypes.value.find(
    (t) => t.name && t.name.includes("羽毛球")
  );
  return (
    badmintonType &&
    filteredCourts.value.find(
      (c) => c.id === courtId.value && c.type_id === badmintonType.id
    )
  );
}

function updateAvailableSlots() {
  const slots = [];
  // 只禁用"已被预约的时间段"内所有半小时起点的时间格
  let selfReservations = [];
  let fullOrPartReservations = [];
  if (isBadmintonCourt()) {
    fullOrPartReservations = reservations.value.filter((r) => {
      const court = courtMap.value[r.court_id];
      if (!court) return false;
      return court.area_type === "full" || court.area_type === "part";
    });
    selfReservations = reservations.value.filter(
      (r) => r.court_id === courtId.value
    );
  }
  // 收集所有被预约的半小时起点
  let occupiedTimes = new Set();
  function addOccupiedTimes(resArr) {
    resArr.forEach((r) => {
      const [h, m] = r.start_time.split(":").map(Number);
      const startMinutes = h * 60 + m;
      const durationMin = Number(r.duration); // 单位为分钟
      const steps = Math.ceil(durationMin / 30);
      for (let i = 0; i < steps; i++) {
        const total = startMinutes + i * 30;
        const slotH = Math.floor(total / 60)
          .toString()
          .padStart(2, "0");
        const slotM = (total % 60).toString().padStart(2, "0");
        const slotTime = `${slotH}:${slotM}:00`;
        occupiedTimes.add(slotTime);
      }
    });
  }
  if (isBadmintonCourt()) {
    addOccupiedTimes(fullOrPartReservations);
    addOccupiedTimes(selfReservations);
  } else {
    addOccupiedTimes(reservations.value);
  }
  for (let h = 8; h < 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:00`;
      let disabled = occupiedTimes.has(time);
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
  // 动态计算可用时长
  availableDurations.value = calcAvailableDurations(val);
  // 如果当前duration不可用，自动切换到第一个可用
  if (!availableDurations.value.includes(duration.value)) {
    duration.value = availableDurations.value[0] || 1;
  }
}
function selectDuration(d) {
  duration.value = d;
  updateAvailableSlots();
}

function calcAvailableDurations(start) {
  // 以start为起点，判断每个时长是否与已有预约冲突
  const result = [];
  for (const d of durations) {
    const minutes = d * 60;
    const conflict = reservations.value.some((r) =>
      isTimeConflict(start, minutes, r.start_time, r.duration)
    );
    if (!conflict) result.push(d);
  }
  return result;
}

function validatePhone(val) {
  // 简单中国大陆手机号校验
  phoneValid.value = /^1[3-9]\d{9}$/.test(val);
  phoneError.value = phoneValid.value || !val ? "" : "请输入有效的手机号";
}

watch(phone, (val) => {
  validatePhone(val);
});

function onPhoneBlur() {
  validatePhone(phone.value);
}

async function submitReservation() {
  if (!courtId.value || !startTime.value || !duration.value || !phone.value) {
    message.value = "请完整填写信息";
    return;
  }
  // 预约前校验所选时间段是否有冲突
  let hasConflict = false;
  const slotDuration = duration.value * 60;
  if (isBadmintonCourt()) {
    const fullOrPartReservations = reservations.value.filter((r) => {
      const court = courtMap.value[r.court_id];
      if (!court) return false;
      return court.area_type === "full" || court.area_type === "part";
    });
    const selfReservations = reservations.value.filter(
      (r) => r.court_id === courtId.value
    );
    hasConflict =
      fullOrPartReservations.some((r) =>
        isTimeConflict(startTime.value, slotDuration, r.start_time, r.duration)
      ) ||
      selfReservations.some((r) =>
        isTimeConflict(startTime.value, slotDuration, r.start_time, r.duration)
      );
  } else {
    hasConflict = reservations.value.some((r) =>
      isTimeConflict(startTime.value, slotDuration, r.start_time, r.duration)
    );
  }
  if (hasConflict) {
    message.value = "该时间段不可预约";
    errorMsg.value = "该时间段不可预约";
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

watch([startTime, duration], () => {
  checkCurrentConflict();
});

// 处理篮球全场和羽毛球分行显示
const displayCourts = computed(() => {
  // 篮球全场排序
  if (
    courtTypeId.value &&
    courtTypes.value.find(
      (t) => t.id === courtTypeId.value && t.name.includes("篮球")
    )
  ) {
    // areaType === 'full' 时只显示全场
    if (areaType.value === "full") {
      // 1号-全场、2号-全场优先，其余小场最后
      const fullCourts = filteredCourts.value.filter(
        (c) => c.area_type === "full"
      );
      const smallCourts = filteredCourts.value.filter(
        (c) => c.area_type !== "full"
      );
      // 按name排序，1号-全场、2号-全场
      fullCourts.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
      return [...fullCourts, ...smallCourts];
    }
  }
  // 羽毛球分行
  const badmintonType = courtTypes.value.find(
    (t) => t.name && t.name.includes("羽毛球")
  );
  if (courtTypeId.value === (badmintonType && badmintonType.id)) {
    // 每行2个
    const rows = [];
    for (let i = 0; i < filteredCourts.value.length; i += 2) {
      rows.push(filteredCourts.value.slice(i, i + 2));
    }
    return rows;
  }
  return filteredCourts.value;
});
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
.duration-select-group {
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
.duration-select,
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
.duration-select.active,
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
.duration-select:hover,
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
.duration-select-group {
  width: 100%;
  margin-bottom: 18px;
  display: flex;
  justify-content: center;
}
.duration-select {
  width: 180px;
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
.duration-select:focus {
  border: 2px solid #409eff;
}
@media (max-width: 600px) {
  .reservation-container {
    padding: 12px 2vw 18px 2vw;
    border-radius: 12px;
  }
  .type-btn,
  .area-btn,
  .court-btn,
  .duration-select,
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
