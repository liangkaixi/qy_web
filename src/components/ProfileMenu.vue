<template>
  <div class="profile-menu">
    <div
      v-for="item in menu"
      :key="item.key"
      class="menu-item"
      @click="onClick(item)"
    >
      <div class="icon">{{ item.icon }}</div>
      <div class="label">{{ item.label }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  menu: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["select"]);
function onClick(item) {
  emit("select", item.key);
}
</script>

<style scoped>
.profile-menu {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.1rem 0.7rem;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(52, 211, 153, 0.09);
  padding: 1.2rem 0.5rem 1.2rem 0.5rem;
  margin-bottom: 1.2rem;
}
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 12px;
  padding: 0.7em 0.2em;
  transition: background 0.2s;
}
.menu-item:hover {
  background: #e6f9f0;
}
.icon {
  font-size: 1.7rem;
  margin-bottom: 0.3em;
}
.label {
  font-size: 1rem;
  color: #333;
}
@media (max-width: 700px) {
  .profile-menu {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.1rem 0.7rem;
  }
}
</style>
