<template>
  <div class="recommend-section">
    <div class="section-title">🌟 今日推荐</div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="items.length === 0" class="empty">暂无推荐内容</div>
    <div class="recommend-list">
      <div v-for="item in items" :key="item.id" class="recommend-card">
        <img
          v-if="item.img"
          :src="item.img"
          class="recommend-img"
          alt="推荐图片"
        />
        <div class="recommend-info">
          <div class="recommend-title">{{ item.title }}</div>
          <div class="recommend-desc">{{ item.description }}</div>
          <a
            v-if="item.link"
            :href="item.link"
            class="recommend-link"
            target="_blank"
            >了解更多</a
          >
        </div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

/**
 * 推荐内容区块，首页使用。
 * 支持通过 props 传入推荐内容列表，或后续扩展为自动拉取推荐数据。
 */
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const loading = ref(false);
// 预留后续自动拉取推荐内容的逻辑
</script>

<style scoped>
.recommend-section {
  max-width: 900px;
  margin: 1.5rem auto 1rem auto;
}
.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1a73e8;
  margin-bottom: 0.7rem;
}
.loading,
.empty {
  text-align: center;
  color: #888;
  margin: 2rem 0;
}
.recommend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
}
.recommend-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(52, 211, 153, 0.09);
  padding: 1.1rem 1.3rem 1.2rem 1.3rem;
  min-width: 220px;
  max-width: 300px;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 1rem;
  position: relative;
}
.recommend-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 0.7em;
}
.recommend-info {
  width: 100%;
}
.recommend-title {
  font-size: 1.05em;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.3em;
}
.recommend-desc {
  font-size: 0.97em;
  color: #666;
  margin-bottom: 0.5em;
}
.recommend-link {
  color: #1a73e8;
  font-size: 0.95em;
  text-decoration: underline;
}
@media (max-width: 700px) {
  .recommend-list {
    flex-direction: column;
    gap: 0.8rem;
  }
  .recommend-card {
    max-width: 100%;
    min-width: 0;
  }
  .recommend-img {
    height: 90px;
  }
}
</style>
