<template>
  <div class="banner-carousel">
    <div class="banner-main">
      <div class="banner-image-wrapper">
        <img :src="images[current]" class="banner-image" alt="banner" />
      </div>
      <div class="banner-info">
        <h2>{{ titles[current] }}</h2>
        <p>{{ descriptions[current] }}</p>
      </div>
    </div>
    <div class="banner-thumbnails">
      <button class="arrow left" @click="prev">&#60;</button>
      <div class="thumbnails-list">
        <img
          v-for="(img, idx) in images"
          :key="idx"
          :src="img"
          :class="['thumbnail', { active: idx === current }]"
          @click="goTo(idx)"
          alt="缩略图"
        />
      </div>
      <button class="arrow right" @click="next">&#62;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { bannerImages } from "../../utils/bannerImages";

const images = ref(bannerImages.map((item) => item.url));
const titles = ref(bannerImages.map((item) => item.title));
const descriptions = ref(bannerImages.map((item) => item.desc));
const current = ref(0);

let timer = null;

function next() {
  current.value = (current.value + 1) % images.value.length;
}
function prev() {
  current.value =
    (current.value - 1 + images.value.length) % images.value.length;
}
function goTo(idx) {
  current.value = idx;
}

function startAutoPlay() {
  stopAutoPlay();
  timer = setInterval(() => {
    next();
  }, 2000);
}
function stopAutoPlay() {
  if (timer) clearInterval(timer);
  timer = null;
}

onMounted(() => {
  startAutoPlay();
});
onUnmounted(() => {
  stopAutoPlay();
});

// 用户手动切换时重置自动播放
watch(current, () => {
  startAutoPlay();
});
</script>

<style scoped>
.banner-carousel {
  width: 100%;
  max-width: 1280px;
  margin: 40px auto 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 3rem 2rem 3rem;
}
.banner-main {
  display: flex;
  align-items: center;
  gap: 3.5rem;
}
.banner-image-wrapper {
  flex: 1 1 62%;
  min-width: 0;
}
.banner-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.banner-info {
  flex: 1 1 38%;
  min-width: 260px;
  padding-left: 1.5rem;
}
.banner-info h2 {
  color: #1a73e8;
  margin-bottom: 1.2rem;
  font-size: 2.2rem;
  font-weight: 700;
}
.banner-info p {
  color: #333;
  font-size: 1.25rem;
  line-height: 1.7;
}
.banner-thumbnails {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  gap: 1.2rem;
}
.thumbnails-list {
  display: flex;
  gap: 1.2rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.thumbnails-list::-webkit-scrollbar {
  display: none;
}
.thumbnail {
  width: 72px;
  height: 48px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0.6;
  border: 2px solid transparent;
  transition: border 0.2s, opacity 0.2s;
  flex-shrink: 0;
}
.thumbnail.active {
  opacity: 1;
  border: 2px solid #1a73e8;
}
.arrow {
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 2rem;
  color: #1a73e8;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.arrow:hover {
  background: #e3eefe;
}
@media (max-width: 1200px) {
  .banner-carousel {
    max-width: 1000px;
    padding: 1.5rem 1rem 1.2rem 1rem;
  }
  .banner-image {
    height: 300px;
  }
  .banner-info h2 {
    font-size: 1.5rem;
  }
  .banner-info p {
    font-size: 1rem;
  }
}
@media (max-width: 900px) {
  .banner-carousel {
    padding: 1rem 0.5rem 1rem 0.5rem;
    border-radius: 8px;
    max-width: 98vw;
  }
  .banner-main {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  .banner-image {
    height: 38vw;
    min-height: 160px;
    max-height: 220px;
    border-radius: 6px;
  }
  .banner-info {
    min-width: 0;
    padding: 0 0.5rem;
    text-align: left;
  }
  .banner-info h2 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  .banner-info p {
    font-size: 0.95rem;
  }
  .banner-thumbnails {
    gap: 0.5rem;
    margin-top: 1rem;
  }
  .thumbnail {
    width: 40px;
    height: 28px;
    border-radius: 3px;
  }
  .arrow {
    width: 32px;
    height: 32px;
    font-size: 1.3rem;
  }
}
@media (max-width: 500px) {
  .banner-image {
    height: 32vw;
    min-height: 100px;
    max-height: 140px;
  }
  .banner-info {
    padding: 0 0.2rem;
  }
}
</style>
