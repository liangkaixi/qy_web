<template>
  <div class="ugc-section">
    <div class="section-title">社区动态</div>
    <div class="ugc-list">
      <div v-for="ugc in ugcList" :key="ugc.id" class="ugc-item">
        <img
          v-if="ugc.user.avatar"
          :src="ugc.user.avatar"
          class="ugc-avatar"
          alt="用户头像"
        />
        <div class="ugc-content">
          <div class="ugc-user">
            <span class="ugc-name">{{ ugc.user.name }}</span>
            <span class="ugc-time">{{ ugc.time }}</span>
          </div>
          <div class="ugc-text">{{ ugc.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  ugcList: {
    type: Array,
    default: () => [],
  },
});
</script>
<style scoped>
.ugc-section {
  max-width: 900px;
  margin: 1.5rem auto 1rem auto;
}
.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1a73e8;
  margin-bottom: 0.7rem;
}
.ugc-list {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.ugc-item {
  display: flex;
  align-items: flex-start;
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  box-shadow: 0 1px 6px rgba(26, 115, 232, 0.04);
}
.ugc-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}
.ugc-content {
  flex: 1;
}
.ugc-user {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.2rem;
}
.ugc-name {
  font-weight: bold;
  color: #222;
}
.ugc-time {
  font-size: 0.92rem;
  color: #888;
}
.ugc-text {
  font-size: 1rem;
  color: #333;
}
</style>
