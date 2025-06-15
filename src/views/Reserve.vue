<template>
  <div class="reserve-page">
    <h1>{{ typeNameMap[type] }}定场地预约</h1>
    <div class="reserve-controls">
      <label>选择日期：</label>
      <input type="date" v-model="date" :min="today" />
    </div>
    <div class="court-list">
      <div v-for="court in courts" :key="court.id" class="court-card">
        <div class="court-title">
          {{ court.name }}<span v-if="court.area">（{{ court.area }}）</span>
        </div>
        <div class="court-times">
          <div
            v-for="slot in getTimeSlots()"
            :key="slot.time"
            class="time-slot"
            :class="{ reserved: slot.reserved }"
          >
            <button
              :disabled="slot.reserved"
              @click="openReserve(court, slot)"
              v-if="!slot.reserved"
            >
              {{ slot.time }}
            </button>
            <span v-else>{{ slot.time }}（已约）</span>
          </div>
        </div>
      </div>
    </div>
    <ReserveDialog
      v-if="showDialog"
      :court="selectedCourt"
      :slot="selectedSlot"
      :date="date"
      :type="type"
      :courts="courts"
      @close="showDialog = false"
      @reserved="onReserved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
// import supabase from '../supabase' // 预留后端集成

import ReserveDialog from "../components/ReserveDialog.vue"; // 预约弹窗组件，后续实现

const typeNameMap = {
  basketball: "篮球",
  badminton: "羽毛球",
  volleyball: "气排球",
};
const route = useRoute();
const type = computed(() => route.params.type || "basketball");
const today = new Date().toISOString().slice(0, 10);
const date = ref(today);

// 示例场地数据，后续用 supabase 查询
const courts = ref([]);

onMounted(() => {
  // 模拟不同类型场地
  if (type.value === "basketball") {
    courts.value = [
      { id: "b1", name: "1号场地", area: "半场" },
      { id: "b2", name: "2号场地", area: "全场" },
      { id: "b3", name: "3号场地", area: "半场" },
    ];
  } else if (type.value === "badminton") {
    courts.value = [
      { id: "bm1", name: "1号场地" },
      { id: "bm2", name: "2号场地" },
      { id: "bm3", name: "3号场地" },
      { id: "bm4", name: "4号场地" },
    ];
  } else if (type.value === "volleyball") {
    courts.value = [
      { id: "v1", name: "1号场地" },
      { id: "v2", name: "2号场地" },
      { id: "v3", name: "3号场地" },
    ];
  }
});

// 时间段生成（6:30~21:30，每小时一段，后续可步进30分钟）
function getTimeSlots() {
  const slots = [];
  let hour = 6,
    min = 30;
  while (hour < 22) {
    const time = `${hour.toString().padStart(2, "0")}:${min
      .toString()
      .padStart(2, "0")}`;
    slots.push({ time, reserved: false }); // reserved: 后续根据预约表判断
    hour++;
    min = 30;
  }
  return slots;
}

// 预约弹窗逻辑
const showDialog = ref(false);
const selectedCourt = ref(null);
const selectedSlot = ref(null);
function openReserve(court, slot) {
  selectedCourt.value = court;
  selectedSlot.value = slot;
  showDialog.value = true;
}
function onReserved() {
  showDialog.value = false;
  // TODO: 预约成功后刷新数据
}
</script>

<style scoped>
.reserve-page {
  max-width: 1100px;
  margin: 48px auto 0 auto;
  padding: 2rem 1rem 3rem 1rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}
h1 {
  color: #1a73e8;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
}
.reserve-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}
.court-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}
.court-card {
  background: #f5f8fe;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(26, 115, 232, 0.06);
  padding: 1.5rem 1rem 1.2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.court-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1a73e8;
  margin-bottom: 1rem;
}
.court-times {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  justify-content: center;
}
.time-slot {
  margin-bottom: 0.2rem;
}
.time-slot button {
  background: #fff;
  color: #1a73e8;
  border: 1px solid #1a73e8;
  border-radius: 6px;
  padding: 0.3rem 1.1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.time-slot button:hover {
  background: #e3eefe;
}
.time-slot.reserved button,
.time-slot.reserved span {
  background: #eee;
  color: #aaa;
  border: 1px solid #ddd;
  cursor: not-allowed;
}
@media (max-width: 700px) {
  .reserve-page {
    max-width: 98vw;
    padding: 0.5rem 0.2rem 1.5rem 0.2rem;
    border-radius: 8px;
  }
  .court-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .court-card {
    padding: 1rem 0.5rem 0.7rem 0.5rem;
    border-radius: 7px;
  }
  h1 {
    font-size: 1.2rem;
  }
}
</style>
