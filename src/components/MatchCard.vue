<template>
  <div class="match-card">
    <div class="creator-info">
      <img
        v-if="match.creator_avatar"
        :src="match.creator_avatar"
        class="creator-avatar"
      />
      <span class="creator-nickname">{{ match.creator_nickname }}</span>
    </div>
    <div class="card-header">
      <span class="sport-type">{{ match.sport_type | typeLabel }}</span>
      <span class="status-pill" :class="match.status">{{
        match.status | statusLabel
      }}</span>
    </div>
    <div class="match-title">{{ match.title || "赛事名称" }}</div>
    <div class="match-info">
      <span>{{ match.match_time ? formatTime(match.match_time) : "--" }}</span>
      <span v-if="match.venue_name">｜{{ match.venue_name }}</span>
      <span v-if="match.court_name">｜{{ match.court_name }}</span>
    </div>
    <div class="match-meta">
      <span>报名：{{ match.signup_count || 0 }}</span>
      <button class="signup-btn" @click="$emit('signup', match.id)">
        我要报名
      </button>
    </div>
  </div>
</template>
<script setup>
import { toRefs } from "vue";
const props = defineProps({
  match: Object,
});
const { match } = toRefs(props);

function formatTime(time) {
  // 格式化时间为 yyyy-MM-dd HH:mm
  const d = new Date(time);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0") +
    " " +
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

const typeMap = {
  basketball: "篮球",
  badminton: "羽毛球",
  volleyball: "气排球",
};
const statusMap = {
  pending: "报名中",
  closed: "已截止",
  finished: "已结束",
};

function typeLabel(val) {
  return typeMap[val] || val || "其他";
}
function statusLabel(val) {
  return statusMap[val] || val;
}
</script>
<script>
export default {
  filters: {
    typeLabel(val) {
      return (
        { basketball: "篮球", badminton: "羽毛球", volleyball: "气排球" }[
          val
        ] ||
        val ||
        "其他"
      );
    },
    statusLabel(val) {
      return (
        { pending: "报名中", closed: "已截止", finished: "已结束" }[val] || val
      );
    },
  },
};
</script>
<style scoped>
.match-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(59, 178, 249, 0.08);
  padding: 18px 20px 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.sport-type {
  color: #3bb2f9;
  font-weight: 600;
  font-size: 15px;
}
.status-pill {
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 13px;
  font-weight: 500;
  background: #f6fafd;
  color: #3bb2f9;
}
.status-pill.closed {
  background: #eee;
  color: #aaa;
}
.status-pill.finished {
  background: #e6f7e6;
  color: #4ee6c1;
}
.match-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin-bottom: 2px;
}
.match-info {
  color: #888;
  font-size: 14px;
  margin-bottom: 2px;
}
.match-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}
.signup-btn {
  background: linear-gradient(90deg, #3bb2f9, #4ee6c1);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 4px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.signup-btn:hover {
  box-shadow: 0 2px 8px rgba(59, 178, 249, 0.18);
}
.creator-info {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 2px;
}
.creator-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 1px 4px rgba(59, 178, 249, 0.1);
}
.creator-nickname {
  color: #3bb2f9;
  font-size: 1em;
  font-weight: 500;
}
</style>
