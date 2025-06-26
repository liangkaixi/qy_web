<template>
  <div class="match-filter">
    <div
      v-for="type in types"
      :key="type.value"
      :class="['filter-tab', { active: type.value === activeType }]"
      @click="$emit('change', type.value)"
    >
      {{ type.label }}
    </div>
  </div>
</template>
<script setup>
defineProps({
  types: Array,
  activeType: String,
});
</script>
<style scoped>
.match-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  justify-content: center;
}
.filter-tab {
  padding: 6px 18px;
  border-radius: 18px;
  background: #f6fafd;
  color: #3bb2f9;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.filter-tab.active {
  background: linear-gradient(90deg, #3bb2f9, #4ee6c1);
  color: #fff;
}
</style>
