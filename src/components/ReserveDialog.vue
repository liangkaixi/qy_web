<template>
  <div class="dialog-mask" @click.self="$emit('close')">
    <div class="dialog">
      <h2>
        预约 {{ court?.name
        }}<span v-if="court?.area">（{{ court.area }}）</span>
      </h2>
      <div class="dialog-row">
        <span>日期：</span><span>{{ date }}</span>
      </div>
      <div class="dialog-row">
        <span>开始时间：</span><span>{{ slot?.time }}</span>
      </div>
      <div class="dialog-row">
        <span>时长：</span>
        <select v-model="duration">
          <option :value="1">1小时</option>
          <option :value="2">2小时</option>
        </select>
      </div>
      <div class="dialog-row">
        <span>价格：</span><span>{{ price }} 元</span>
      </div>
      <div class="dialog-row">
        <span>手机号：</span>
        <input
          v-model="phone"
          type="tel"
          maxlength="11"
          placeholder="请输入手机号"
        />
      </div>
      <div class="dialog-actions">
        <button @click="$emit('close')">取消</button>
        <button :disabled="loading" @click="onReserve">确认预约</button>
      </div>
      <div v-if="error" class="dialog-error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import supabase from "../supabase";

const props = defineProps({
  court: Object,
  slot: Object,
  date: String,
  type: String,
  courts: Array,
});
const emit = defineEmits(["close", "reserved"]);

const duration = ref(1);
const price = computed(() => 20 * duration.value);
const phone = ref("");
const loading = ref(false);
const error = ref("");

watch(
  () => props.slot,
  () => {
    duration.value = 1;
    error.value = "";
  }
);

function validatePhone(val) {
  return /^1[3-9]\d{9}$/.test(val);
}

async function onReserve() {
  error.value = "";
  if (!validatePhone(phone.value)) {
    error.value = "请输入有效的手机号";
    return;
  }
  loading.value = true;

  // 1. 预约冲突校验（篮球场地全场/半场互斥）
  let relatedCourtIds = [props.court.id];
  if (props.type === "basketball" && props.court.area) {
    // 找到同一场地下所有相关 court_id
    if (props.court.area === "全场") {
      // 预约全场，查所有半场
      relatedCourtIds = props.courts
        .filter(
          (c) => c.name === props.court.name && c.area && c.area !== "全场"
        )
        .map((c) => c.id);
    } else {
      // 预约半场，查全场和自身
      relatedCourtIds = props.courts
        .filter(
          (c) =>
            c.name === props.court.name &&
            (c.area === "全场" || c.id === props.court.id)
        )
        .map((c) => c.id);
    }
  }

  const { data: exists, error: checkErr } = await supabase
    .from("qy_court_reservations")
    .select("id, status")
    .in("court_id", relatedCourtIds)
    .eq("date", props.date)
    .eq("start_time", props.slot.time);
  if (checkErr) {
    error.value = "校验失败，请重试";
    loading.value = false;
    return;
  }
  if (
    exists &&
    exists.some((r) => r.status === "reserved" || r.status === "confirmed")
  ) {
    error.value = "该时间段已被预约，请选择其他时间";
    loading.value = false;
    return;
  }
  // 2. 写入预约表
  const { error: insertErr } = await supabase
    .from("qy_court_reservations")
    .insert({
      court_id: props.court.id,
      date: props.date,
      start_time: props.slot.time,
      duration: duration.value,
      price: price.value,
      phone: phone.value,
      status: "reserved",
    });
  loading.value = false;
  if (insertErr) {
    error.value = "预约失败，请稍后重试";
    return;
  }
  alert("预约成功！");
  emit("reserved");
  emit("close");
}
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 32px rgba(26, 115, 232, 0.13);
  padding: 2.2rem 2.5rem 1.5rem 2.5rem;
  min-width: 320px;
  max-width: 95vw;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
h2 {
  color: #1a73e8;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  text-align: center;
}
.dialog-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.05rem;
}
.dialog-row input,
.dialog-row select {
  flex: 1;
  padding: 0.3rem 0.7rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 0.5rem;
}
.dialog-actions button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  background: #1a73e8;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.dialog-actions button:disabled {
  background: #b3c7e6;
  cursor: not-allowed;
}
.dialog-actions button:first-child {
  background: #eee;
  color: #1a73e8;
}
.dialog-error {
  color: #e53935;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.98rem;
}
@media (max-width: 600px) {
  .dialog {
    padding: 1.2rem 0.5rem 0.7rem 0.5rem;
    min-width: 0;
  }
  h2 {
    font-size: 1.05rem;
  }
}
</style>
