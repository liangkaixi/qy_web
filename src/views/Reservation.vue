<template>
  <div class="reservation-list">
    <div class="reservation-row" @click="showType = true">
      <span>运动项目</span>
      <span class="reservation-value">{{ selectedTypeName || "请选择" }}</span>
      <span class="reservation-arrow">›</span>
    </div>
    <div class="reservation-row" v-if="showAreaRow" @click="showArea = true">
      <span>分区</span>
      <span class="reservation-value">{{ selectedAreaLabel || "请选择" }}</span>
      <span class="reservation-arrow">›</span>
    </div>
    <div class="reservation-row" @click="showCourt = true">
      <span>场地</span>
      <span class="reservation-value">{{ selectedCourtName || "请选择" }}</span>
      <span class="reservation-arrow">›</span>
    </div>
    <div class="reservation-row" @click="showDate = true">
      <span>日期</span>
      <span class="reservation-value">{{ selectedDateLabel || "请选择" }}</span>
      <span class="reservation-arrow">›</span>
    </div>
    <div
      class="reservation-row"
      @click="showTime = true"
      :class="{ disabled: !canPickTime }"
    >
      <span>开始时间</span>
      <span class="reservation-value">{{ selectedTimeLabel || "请选择" }}</span>
      <span class="reservation-arrow">›</span>
    </div>
    <div
      class="reservation-row"
      @click="showDuration = true"
      :class="{ disabled: !canPickDuration }"
    >
      <span>预约时长</span>
      <span class="reservation-value">{{
        selectedDurationLabel || "请选择"
      }}</span>
      <span class="reservation-arrow">›</span>
    </div>
    <div class="reservation-row">
      <span>手机号</span>
      <input
        class="reservation-input"
        v-model="phone"
        maxlength="11"
        placeholder="请输入手机号"
      />
    </div>
    <div class="reservation-row">
      <span>预约可见性</span>
      <div class="visibility-select">
        <label>
          <input type="radio" value="public" v-model="visibility" />
          公开
        </label>
        <label>
          <input type="radio" value="invite" v-model="visibility" />
          仅限邀请
        </label>
      </div>
    </div>
    <button
      class="submit-btn"
      @click="submitReservation"
      :disabled="!canSubmit"
    >
      立即预约
    </button>
    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <!-- 选择弹窗 -->
    <TypeSelect
      v-if="showType"
      :types="courtTypes"
      @select="onTypeSelect"
      @close="showType = false"
    />
    <AreaSelect
      v-if="showArea"
      :areas="areaOptions"
      @select="onAreaSelect"
      @close="showArea = false"
    />
    <CourtSelect
      v-if="showCourt"
      :courts="filteredCourts"
      @select="onCourtSelect"
      @close="showCourt = false"
    />
    <DateSelect
      v-if="showDate"
      :dates="dateOptions"
      @select="onDateSelect"
      @close="showDate = false"
    />
    <TimeSelect
      v-if="showTime"
      :slots="timeSlots"
      @select="onTimeSelect"
      @close="showTime = false"
    />
    <DurationSelect
      v-if="showDuration"
      :options="durationOptions"
      @select="onDurationSelect"
      @close="showDuration = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import supabase from "@/supabase";
import TypeSelect from "@/components/TypeSelect.vue";
import AreaSelect from "@/components/AreaSelect.vue";
import CourtSelect from "@/components/CourtSelect.vue";
import DateSelect from "@/components/DateSelect.vue";
import TimeSelect from "@/components/TimeSelect.vue";
import DurationSelect from "@/components/DurationSelect.vue";

const showType = ref(false);
const showArea = ref(false);
const showCourt = ref(false);
const showDate = ref(false);
const showTime = ref(false);
const showDuration = ref(false);

const courtTypes = ref([]);
const areaOptions = [
  { label: "全场", value: "full" },
  { label: "半场", value: "part" },
];
const filteredCourts = ref([]);
const dateOptions = ref([]);
const timeSlots = ref([]);
const durationOptions = ref([]);

const selectedType = ref(null);
const selectedArea = ref(null);
const selectedCourt = ref(null);
const selectedDate = ref(null);
const selectedTime = ref(null);
const selectedDuration = ref(null);
const phone = ref("");
const message = ref("");
const errorMsg = ref("");
const visibility = ref("public");

const selectedTypeName = computed(() => selectedType.value?.name || "");
const selectedAreaLabel = computed(() => selectedArea.value?.label || "");
const selectedCourtName = computed(() => selectedCourt.value?.name || "");
const selectedDateLabel = computed(() => selectedDate.value?.label || "");
const selectedTimeLabel = computed(() => selectedTime.value?.label || "");
const selectedDurationLabel = computed(
  () => selectedDuration.value?.label || ""
);
const showAreaRow = computed(
  () => selectedType.value && selectedType.value.name.includes("篮球")
);
const canPickTime = computed(() => selectedCourt.value && selectedDate.value);
const canPickDuration = computed(() => selectedTime.value);
const canSubmit = computed(
  () =>
    selectedType.value &&
    (!showAreaRow.value || selectedArea.value) &&
    selectedCourt.value &&
    selectedDate.value &&
    selectedTime.value &&
    selectedDuration.value &&
    /^1\d{10}$/.test(phone.value)
);

let allRelatedReservations = ref([]);
const currentUser = ref(null);

onMounted(() => {
  fetchCourtTypes();
  setDateOptions();
  const savedPhone = localStorage.getItem("reservation_phone");
  if (savedPhone) phone.value = savedPhone;
  const u = localStorage.getItem("qy_user");
  currentUser.value = u ? JSON.parse(u) : null;
});

async function fetchCourtTypes() {
  const { data } = await supabase.from("qy_court_types").select("id, name");
  courtTypes.value = data || [];
}

watch([selectedType, selectedArea], async ([type, area]) => {
  selectedCourt.value = null;
  if (!type) return;
  let query = supabase
    .from("qy_courts")
    .select("id, name, type_id, area_type, resource_group");
  query = query.eq("type_id", type.id);
  if (showAreaRow.value && area?.value)
    query = query.eq("area_type", area.value);
  const { data } = await query;
  filteredCourts.value = data || [];
});

watch([selectedCourt, selectedDate], async ([court, date]) => {
  selectedTime.value = null;
  selectedDuration.value = null;
  timeSlots.value = [];
  durationOptions.value = [];
  if (!court || !date) return;
  // 1. 查找所有冲突场地ID（含自身）
  const { data: conflictRows } = await supabase
    .from("qy_court_conflicts")
    .select("conflict_court_id")
    .eq("court_id", court.id);
  const conflictCourtIds = (conflictRows || []).map((r) => r.conflict_court_id);
  if (!conflictCourtIds.includes(court.id)) {
    conflictCourtIds.push(court.id);
  }
  // 2. 查找这些场地的预约
  const { data: reservations } = await supabase
    .from("qy_court_reservations")
    .select("court_id, start_time, duration")
    .eq("date", date.value)
    .in("court_id", conflictCourtIds);
  allRelatedReservations.value = reservations || [];
  genTimeSlots(allRelatedReservations.value);
});

function genTimeSlots(reservations) {
  const slots = [];
  for (let h = 8; h < 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const startMin = h * 60 + m;
      const label = `${h}:${m === 0 ? "00" : m}`;
      const value = `${h.toString().padStart(2, "0")}:${m === 0 ? "00" : m}:00`;
      const conflict = reservations.some((r) => {
        const rStart =
          parseInt(r.start_time.split(":")[0]) * 60 +
          parseInt(r.start_time.split(":")[1]);
        const rEnd = rStart + r.duration;
        return startMin >= rStart && startMin < rEnd;
      });
      slots.push({ label, value, disabled: conflict });
    }
  }
  timeSlots.value = slots;
}

function onTypeSelect(type) {
  selectedType.value = type;
  selectedArea.value = null;
  showType.value = false;
}
function onAreaSelect(area) {
  selectedArea.value = area;
  showArea.value = false;
}
function onCourtSelect(court) {
  selectedCourt.value = court;
  showCourt.value = false;
}
function onDateSelect(date) {
  selectedDate.value = date;
  showDate.value = false;
}
function onTimeSelect(slot) {
  selectedTime.value = slot;
  selectedDuration.value = null;
  showTime.value = false;
  genDurationOptions(slot.value, allRelatedReservations.value);
  showDuration.value = true;
}
function genDurationOptions(startTime, reservations) {
  const maxHour = 3;
  const startMin =
    parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
  const options = [];
  for (let h = 1; h <= maxHour; h++) {
    const endMin = startMin + h * 60;
    const conflict = reservations.some((r) => {
      const rStart =
        parseInt(r.start_time.split(":")[0]) * 60 +
        parseInt(r.start_time.split(":")[1]);
      const rEnd = rStart + r.duration;
      return startMin < rEnd && endMin > rStart;
    });
    options.push({ label: `${h}小时`, value: h, disabled: conflict });
    if (conflict) break;
  }
  durationOptions.value = options.filter((opt) => !opt.disabled);
}
function onDurationSelect(opt) {
  selectedDuration.value = opt;
  showDuration.value = false;
}
async function submitReservation() {
  if (!canSubmit.value) return;
  errorMsg.value = "";
  message.value = "";
  if (!currentUser.value) {
    errorMsg.value = "请先登录";
    return;
  }
  // 1. 查找所有冲突场地ID（含自身）
  const { data: conflictRows } = await supabase
    .from("qy_court_conflicts")
    .select("conflict_court_id")
    .eq("court_id", selectedCourt.value.id);
  const conflictCourtIds = (conflictRows || []).map((r) => r.conflict_court_id);
  if (!conflictCourtIds.includes(selectedCourt.value.id)) {
    conflictCourtIds.push(selectedCourt.value.id);
  }
  // 2. 查找这些场地的预约
  const { data: exist } = await supabase
    .from("qy_court_reservations")
    .select("id, start_time, duration")
    .eq("date", selectedDate.value.value)
    .in("court_id", conflictCourtIds);
  // 3. 判断时间段是否冲突
  const startMin =
    parseInt(selectedTime.value.value.split(":")[0]) * 60 +
    parseInt(selectedTime.value.value.split(":")[1]);
  const endMin = startMin + selectedDuration.value.value * 60;
  const conflict = (exist || []).some((r) => {
    const rStart =
      parseInt(r.start_time.split(":")[0]) * 60 +
      parseInt(r.start_time.split(":")[1]);
    const rEnd = rStart + r.duration;
    return startMin < rEnd && endMin > rStart;
  });
  if (conflict) {
    errorMsg.value = "该时段已被预约，请选择其他时间";
    return;
  }
  // 4. 插入预约，带 user_id，duration 单位为分钟
  const { error } = await supabase.from("qy_court_reservations").insert({
    court_id: selectedCourt.value.id,
    date: selectedDate.value.value,
    start_time: selectedTime.value.value,
    duration: selectedDuration.value.value * 60,
    price: 0,
    phone: phone.value,
    status: "reserved",
    visibility: visibility.value,
    user_id: currentUser.value.id,
  });
  if (!error) {
    message.value = "预约成功！";
    localStorage.setItem("reservation_phone", phone.value);
    setTimeout(() => {
      message.value = "";
    }, 2000);
  } else {
    errorMsg.value = "预约失败，请重试";
  }
}
function setDateOptions() {
  const today = new Date();
  dateOptions.value = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      label: `${d.getMonth() + 1}月${d.getDate()}日${i === 0 ? " (今天)" : ""}`,
      value: d.toISOString().slice(0, 10),
    };
  });
}
</script>

<style scoped>
.reservation-list {
  background: #fff;
  border-radius: 14px;
  margin: 1.5rem 0.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.reservation-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.2rem;
  border-bottom: 1px solid #f2f2f2;
  font-size: 1.13rem;
  color: #222;
  cursor: pointer;
  background: #fff;
  transition: background 0.2s;
}
.reservation-row:last-child {
  border-bottom: none;
}
.reservation-row:active {
  background: #f5f7fa;
}
.reservation-row.disabled {
  color: #bbb;
  background: #f7f7f7;
  cursor: not-allowed;
}
.reservation-arrow {
  color: #bbb;
  font-size: 1.3rem;
  font-weight: bold;
  margin-left: 0.5rem;
  user-select: none;
}
.reservation-value {
  color: #888;
  margin-right: 0.5rem;
}
.reservation-input {
  border: none;
  background: transparent;
  font-size: 1.13rem;
  color: #222;
  outline: none;
  width: 120px;
  text-align: right;
}
.submit-btn {
  width: 90%;
  margin: 1.2rem 5%;
  background: linear-gradient(90deg, #1a73e8 0%, #34d399 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 0.9rem 0;
  font-size: 1.15rem;
  font-weight: bold;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.message {
  color: #22c55e;
  text-align: center;
  margin-bottom: 0.5rem;
}
.error-msg {
  color: #ef4444;
  text-align: center;
  margin-bottom: 0.5rem;
}
.visibility-select {
  display: flex;
  gap: 1.2em;
  font-size: 1.05em;
}
.visibility-select label {
  cursor: pointer;
  color: #1a73e8;
}
.visibility-select input[type="radio"] {
  margin-right: 0.3em;
}
</style>
