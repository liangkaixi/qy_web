<template>
  <div class="select-mask" @click.self="$emit('close')">
    <div class="select-popup">
      <div class="select-title">选择开始时间</div>
      <div class="select-list">
        <div
          v-for="slot in slots"
          :key="slot.value"
          class="select-item"
          :class="{ disabled: slot.disabled }"
          @click="!slot.disabled && $emit('select', slot)"
        >
          {{ slot.label }}
          <span v-if="slot.disabled" class="slot-tip">（已被预约）</span>
        </div>
      </div>
      <div class="select-cancel" @click="$emit('close')">取消</div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  slots: { type: Array, default: () => [] },
});
</script>
<style scoped>
.select-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.select-popup {
  background: #fff;
  border-radius: 18px 18px 0 0;
  width: 100vw;
  max-width: 420px;
  margin-bottom: 0;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
  padding-bottom: 1.2rem;
}
.select-title {
  text-align: center;
  font-weight: bold;
  font-size: 1.15rem;
  padding: 1.1rem 0 0.5rem 0;
}
.select-list {
  display: flex;
  flex-direction: column;
}
.select-item {
  padding: 1rem 0;
  text-align: center;
  font-size: 1.13rem;
  color: #1a73e8;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
}
.select-item:last-child {
  border-bottom: none;
}
.select-item:active {
  background: #f5f7fa;
}
.select-item.disabled {
  color: #bbb;
  background: #f7f7f7;
  cursor: not-allowed;
}
.slot-tip {
  color: #bbb;
  font-size: 0.95em;
  margin-left: 0.5em;
}
.select-cancel {
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  padding: 1rem 0 0.2rem 0;
  cursor: pointer;
}
</style>
