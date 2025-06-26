<template>
  <div class="announcement-bar">
    <span class="icon">📢</span>
    <div class="announcements">
      <span v-for="a in announcements" :key="a.id" class="announcement-item">
        {{ a.text }}
      </span>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  announcements: {
    type: Array,
    default: () => [],
  },
});
</script>
<style scoped>
.announcement-bar {
  display: flex;
  align-items: center;
  background: #f3f8fd;
  color: #1a73e8;
  border-radius: 12px;
  padding: 0.5rem 1rem;
  margin: 0.5rem auto 1rem auto;
  max-width: 900px;
  font-size: 1rem;
}
.icon {
  font-size: 1.3rem;
  margin-right: 0.7rem;
}
.announcements {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
}
.announcement-item {
  white-space: nowrap;
}
</style>
