<template>
  <BannerCarousel />
  <div class="features-grid">
    <div
      v-for="f in features"
      :key="f.title"
      class="feature-item"
      @click="goFeature(f.path)"
    >
      <div class="feature-icon">{{ f.icon }}</div>
      <div class="feature-title">{{ f.title }}</div>
      <div class="feature-desc">{{ f.desc }}</div>
    </div>
  </div>
</template>

<script setup>
import BannerCarousel from "../components/banner/BannerCarousel.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const features = [
  {
    title: "篮球",
    icon: "🏀",
    desc: "标准篮球场地，专业赛事与训练环境。",
    path: "/basketball",
  },
  {
    title: "羽毛球",
    icon: "🏸",
    desc: "4块羽毛球场，舒适灯光，畅享挥拍乐趣。",
    path: "/badminton",
  },
  {
    title: "气排球",
    icon: "🏐",
    desc: "气排球专用场地，团体活动首选。",
    path: "/volleyball",
  },
  {
    title: "体适能",
    icon: "💪",
    desc: "体能训练区，科学健身，提升综合素质。",
    path: "/fitness",
  },
];

function goFeature(path) {
  router.push(path);
}
</script>

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1100px;
  margin: 48px auto 0 auto;
  padding: 2rem 1rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}
.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem 0.5rem;
  border-radius: 8px;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}
.feature-item:hover {
  box-shadow: 0 4px 24px rgba(26, 115, 232, 0.1);
  transform: translateY(-4px) scale(1.03);
}
.feature-icon {
  font-size: 2.8rem;
  margin-bottom: 1rem;
}
.feature-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #1a73e8;
  margin-bottom: 0.5rem;
}
.feature-desc {
  color: #333;
  font-size: 1rem;
  text-align: center;
}
@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
    padding: 1.2rem 0.5rem;
  }
}
@media (max-width: 500px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
    padding: 0.5rem 0.2rem;
  }
}
</style>
