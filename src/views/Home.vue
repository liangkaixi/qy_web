<template>
  <!-- 顶部品牌区 -->
  <div class="home-header">
    <div class="brand-slogan">泸溪青沅-运动让生活更精彩</div>
  </div>
  <!-- 轮播横幅 -->
  <BannerCarousel />
  <!-- 核心功能入口 -->
  <div class="core-actions">
    <ActionButton icon="📅" text="立即预约" @click="goReserve" />
    <ActionButton icon="🎓" text="课程报名" @click="goCourse" />
    <ActionButton icon="🏆" text="赛事报名" @click="goActivity" />
    <ActionButton icon="📊" text="我的数据" @click="goData" />
  </div>
  <!-- 公告栏 -->
  <AnnouncementBar :announcements="announcements" />
  <!-- 推荐区 -->
  <RecommendSection :items="recommendList" />
  <!-- 公开预约区 -->
  <PublicReservationsSection />
  <!-- 社区UGC区 -->
  <UGCSection :ugcList="ugcList" />
  <!-- 底部主导航栏 -->
  <NavBar />
</template>

<script setup>
import BannerCarousel from "../components/banner/BannerCarousel.vue";
import NavBar from "../components/NavBar.vue";
import ActionButton from "../components/ActionButton.vue";
import AnnouncementBar from "../components/AnnouncementBar.vue";
import RecommendSection from "../components/RecommendSection.vue";
import UGCSection from "../components/UGCSection.vue";
import PublicReservationsSection from "../components/PublicReservationsSection.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import supabase from "../supabase";

const router = useRouter();

// 公告、推荐、UGC 数据
const announcements = ref([]);
const recommendList = ref([]);
const ugcList = ref([]);

// 示例：页面加载时拉取数据
onMounted(() => {
  fetchAnnouncements();
  fetchRecommendList();
  fetchUGCList();
});

function goReserve() {
  router.push("/reserve");
}
function goCourse() {
  router.push("/train");
}
function goActivity() {
  router.push("/match");
}
function goData() {
  router.push("/student");
}

// 数据接口对接示例
async function fetchAnnouncements() {
  // TODO: 替换为实际API
  announcements.value = [
    { id: 1, text: "6月场地预约已开放，欢迎预订！" },
    { id: 2, text: "暑期篮球训练营报名中，名额有限！" },
  ];
}

async function fetchRecommendList() {
  const { data, error } = await supabase
    .from("qy_recommend_items")
    .select("id, title, description, img, link")
    .order("created_at", { ascending: false })
    .limit(4);
  if (!error && data) {
    // 兼容旧字段名 desc
    recommendList.value = data.map((item) => ({
      ...item,
      desc: item.description || item.desc || "",
    }));
  }
}

async function fetchUGCList() {
  const { data, error } = await supabase
    .from("qy_ugc_posts")
    .select("id, content, created_at, user: user_id (nickname, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(5);
  if (!error && data) {
    ugcList.value = data.map((item) => ({
      id: item.id,
      user: {
        name: item.user?.nickname || "匿名",
        avatar: item.user?.avatar_url || "",
      },
      content: item.content,
      time: formatTime(item.created_at),
    }));
  }
}

function formatTime(ts) {
  const date = new Date(ts);
  const now = Date.now();
  const diff = (now - date.getTime()) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return date.toLocaleDateString();
}
</script>

<style scoped>
.home-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0 1rem 0;
  background: linear-gradient(90deg, #1a73e8 0%, #34d399 100%);
  border-radius: 0 0 32px 32px;
}
.brand-logo {
  width: 96px;
  height: 96px;
  max-width: 40vw;
  max-height: 20vh;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
.brand-slogan {
  margin-top: 8px;
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 2px;
}
.core-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  margin: 1.5rem auto 1rem auto;
  max-width: 900px;
  gap: 1.2rem;
}
.core-actions :deep(.action-btn) {
  flex: 1 1 40%;
  min-width: 140px;
  max-width: 48%;
  margin-bottom: 0.5rem;
}
.home-header {
  padding-top: 72px; /* 导航条高度+额外留白 */
  /* 其他样式 */
}
.brand-slogan {
  margin-top: 16px; /* 或更大，根据实际情况调整 */
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 2px;
}
@media (max-width: 700px) {
  .core-actions {
    gap: 0.8rem;
  }
  .core-actions :deep(.action-btn) {
    max-width: 48%;
    min-width: 120px;
  }
  .home-header {
    padding-top: 20px; /* 导航条高度+额外留白 */
    /* 其他样式 */
  }
  .brand-slogan {
    margin-top: 16px; /* 或更大，根据实际情况调整 */
    font-size: 1.3rem;
    font-weight: bold;
    letter-spacing: 2px;
  }
}
</style>
