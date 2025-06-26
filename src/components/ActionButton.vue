<template>
  <button class="action-btn" @click="$emit('click')">
    <span class="icon">{{ icon }}</span>
    <span class="text">{{ text }}</span>
  </button>
</template>
<script setup>
defineProps({
  icon: String,
  text: String,
});
</script>
<style scoped>
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #1a73e8 0%, #34d399 100%);
  color: #fff;
  border: none;
  border-radius: 18px;
  padding: 1.2rem 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  box-shadow: 0 2px 12px rgba(26, 115, 232, 0.08);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}
.action-btn:hover {
  box-shadow: 0 4px 24px rgba(26, 115, 232, 0.15);
  transform: translateY(-2px) scale(1.04);
}
.icon {
  font-size: 2rem;
  margin-bottom: 0.3rem;
}
.text {
  font-size: 1.1rem;
}
</style>
