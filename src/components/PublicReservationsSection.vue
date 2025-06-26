<template>
  <div class="public-reservations-section">
    <div class="section-title">🔥 正在进行的公开约球/场地活动</div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="reservations.length === 0" class="empty">
      暂无公开活动，快去发起预约吧！
    </div>
    <div class="reservation-list">
      <div v-for="item in reservations" :key="item.id" class="reservation-card">
        <div class="card-header">
          <span class="sport-type">{{ item.court_type_name }}</span>
          <span class="venue-name">{{ item.venue_name }}</span>
          <span class="court-name">{{ item.court_name }}</span>
        </div>
        <div class="card-main">
          <div class="time-info">
            <span class="date">{{ item.date }}</span>
            <span class="start-time">{{ item.start_time.slice(0, 5) }}</span>
            <span class="duration">/{{ item.duration }}分钟</span>
          </div>
          <div class="initiator-info">
            <span class="label">发起人：</span>
            <span class="initiator-avatar-name">
              <template v-if="item.initiator_avatar">
                <img :src="item.initiator_avatar" class="avatar-mini" />
              </template>
              <span class="initiator-name">{{
                item.initiator_nickname || "匿名"
              }}</span>
            </span>
          </div>
          <div class="participants-info">
            <span class="label">报名人数：</span>
            <span class="participant-count">{{ item.participant_count }}</span>
            <span class="avatars">
              <img
                v-for="(p, idx) in (item.participants || [])
                  .filter((p) => p && p.avatar)
                  .slice(0, 5)"
                :key="p.user_id"
                :src="p.avatar"
                class="avatar-mini"
                :title="p.nickname"
                :style="{
                  zIndex: 10 - idx,
                  marginLeft: idx === 0 ? '8px' : '-10px',
                }"
              />
            </span>
          </div>
          <div class="tags">
            <span v-if="item.visibility === 'public'" class="tag tag-public"
              >公开</span
            >
            <span v-if="item.leftMinutes > 0" class="tag tag-hot"
              >剩余{{ Math.floor(item.leftMinutes / 60) }}小时{{
                item.leftMinutes % 60
              }}分钟</span
            >
            <span v-else class="tag tag-expired">已结束</span>
          </div>
        </div>
        <button
          class="join-btn"
          :disabled="
            isInitiator(item) ||
            item.joined ||
            item.leftMinutes <= 0 ||
            joinLoadingId === item.id
          "
          @click="join(item)"
        >
          <span v-if="isInitiator(item)">我是发起人</span>
          <span v-else-if="item.joined">已报名</span>
          <span v-else-if="joinLoadingId === item.id">报名中...</span>
          <span v-else>我要参加</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getPublicReservationsWithUsers,
  joinReservation,
} from "@/api/reservations";
import { getCourtTypes } from "@/api/courtTypes";
import { getVenues } from "@/api/venues";

function getCurrentUser() {
  const u = localStorage.getItem("qy_user");
  return u ? JSON.parse(u) : null;
}

const loading = ref(true);
const reservations = ref([]);
const joinLoadingId = ref(null);

const courtTypeMap = ref({});
const venueMap = ref({});

const router = useRouter();

onMounted(async () => {
  loading.value = true;
  const [types, venues] = await Promise.all([getCourtTypes(), getVenues()]);
  types.forEach((t) => {
    courtTypeMap.value[t.id] = t.name;
  });
  venues.forEach((v) => {
    venueMap.value[v.id] = v.name;
  });
  await fetchReservations();
  loading.value = false;
});

async function fetchReservations() {
  loading.value = true;
  try {
    const data = await getPublicReservationsWithUsers();
    console.log("getPublicReservationsWithUsers 原始数据:", data);
    const now = new Date();
    reservations.value = data.map((item) => {
      const start = new Date(item.date + "T" + item.start_time);
      const end = new Date(start.getTime() + item.duration * 60000);
      const leftMinutes = Math.max(0, Math.floor((end - now) / 60000));
      const user = getCurrentUser();
      const isInitiator =
        user && item.initiator_id && user.id === item.initiator_id;
      return {
        ...item,
        leftMinutes,
        joined:
          !isInitiator &&
          user &&
          Array.isArray(item.participants) &&
          item.participants.some((p) => p.user_id === user.id),
      };
    });
    console.log("最终 reservations.value:", reservations.value);
  } catch (e) {
    reservations.value = [];
    window.$toast && window.$toast("公开活动加载失败，请稍后重试");
    console.error("getPublicReservationsWithUsers error:", e);
  }
  loading.value = false;
}
async function join(item) {
  const user = getCurrentUser();
  if (!user) {
    router.push("/login"); // 未登录跳转登录页
    return;
  }
  joinLoadingId.value = item.id;
  try {
    await joinReservation(item.id, user.id, user.phone || "");
    item.joined = true;
    item.participant_count += 1;
    window.$toast && window.$toast("报名成功！");
  } catch (e) {
    alert(e.message || "报名失败");
  } finally {
    joinLoadingId.value = null;
  }
}

function isInitiator(item) {
  const user = getCurrentUser();
  return user && item.initiator_id && user.id === item.initiator_id;
}
</script>

<style scoped>
.public-reservations-section {
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
.reservation-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
}
.reservation-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(52, 211, 153, 0.09);
  padding: 1.1rem 1.3rem 1.2rem 1.3rem;
  min-width: 220px;
  max-width: 300px;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1rem;
  position: relative;
}
.card-header {
  display: flex;
  gap: 0.7rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1a73e8;
  margin-bottom: 0.5rem;
}
.sport-type {
  background: linear-gradient(90deg, #1a73e8 0%, #34d399 100%);
  color: #fff;
  border-radius: 8px;
  padding: 0 0.5em;
  font-size: 0.98em;
}
.venue-name,
.court-name {
  color: #34d399;
  font-size: 0.97em;
}
.card-main {
  margin-bottom: 0.7rem;
}
.time-info {
  font-size: 1.05em;
  color: #222;
  margin-bottom: 0.3em;
}
.initiator-info {
  font-size: 0.97em;
  color: #666;
  display: flex;
  align-items: center;
  margin-bottom: 0.2em;
}
.initiator-avatar-name {
  display: flex;
  align-items: center;
}
.avatar-mini {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 6px;
  border: 1px solid #e3eefe;
  background: #f6f8fa;
}
.participants-info {
  font-size: 0.97em;
  color: #666;
  margin-bottom: 0.2em;
}
.tags {
  margin-top: 0.3em;
}
.tag {
  display: inline-block;
  font-size: 0.92em;
  border-radius: 6px;
  padding: 0.1em 0.6em;
  margin-right: 0.5em;
}
.tag-public {
  background: #e3f6fc;
  color: #1a73e8;
}
.tag-hot {
  background: #e6f9f0;
  color: #34d399;
}
.tag-expired {
  background: #f8d7da;
  color: #c82333;
}
.join-btn {
  margin-top: 0.7em;
  padding: 0.5em 0;
  background: linear-gradient(90deg, #1a73e8 0%, #34d399 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1.08em;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 6px rgba(52, 211, 153, 0.08);
}
.join-btn:disabled {
  background: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}
@media (max-width: 700px) {
  .reservation-list {
    flex-direction: column;
    gap: 0.8rem;
  }
  .reservation-card {
    max-width: 100%;
    min-width: 0;
  }
}
.avatars {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
}
.more {
  font-size: 0.9em;
  color: #888;
  margin-left: 2px;
}
</style>
