<template>
  <div class="recommend-section">
    <h3>推荐内容</h3>
    <ul>
      <li v-for="item in items" :key="item.id">
        <img
          v-if="item.img"
          :src="item.img"
          :alt="item.title"
          class="recommend-img"
        />
        <div class="recommend-info">
          <div class="recommend-title">{{ item.title }}</div>
          <div class="recommend-desc">{{ item.description }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
// 假设后续可从API获取推荐内容
const items = ref([
  { id: 1, title: "篮球体验课", description: "限时特惠，立即报名", img: "" },
  { id: 2, title: "羽毛球场地预约", description: "热门时段抢订", img: "" },
]);
// 可在onMounted中请求API获取真实数据
</script>
<style scoped>
.recommend-section {
  padding: 16px 0;
}
.recommend-section h3 {
  font-size: 18px;
  margin-bottom: 10px;
}
.recommend-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.recommend-section li {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(59, 178, 249, 0.08);
  padding: 10px;
}
.recommend-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 12px;
  background: #f0f0f0;
}
.recommend-info {
  flex: 1;
}
.recommend-title {
  font-weight: 600;
  font-size: 16px;
}
.recommend-desc {
  color: #888;
  font-size: 13px;
  margin-top: 2px;
}
</style>
