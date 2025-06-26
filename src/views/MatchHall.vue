<template>
  <div class="match-hall">
    <div class="match-hall-header">
      <h2>赛事大厅</h2>
      <button class="publish-btn" @click="onPublish">发布赛事</button>
    </div>
    <MatchFilter
      :types="types"
      :activeType="activeType"
      @change="onTypeChange"
    />
    <div v-if="loading" class="loading">加载中...</div>
    <MatchList v-else :matches="matches" @signup="onSignup" />
    <div v-if="!loading && matches.length === 0" class="empty">
      暂无赛事，快来发布吧！
    </div>
    <MatchPublishDialog
      v-if="showPublish"
      :show="showPublish"
      @close="onPublishClose"
      @success="onPublishSuccess"
    />
    <MatchSignupDialog
      v-if="showSignup"
      :show="showSignup"
      :matchId="signupMatchId"
      :userId="userId"
      @close="onSignupClose"
      @success="onSignupSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import MatchFilter from "../components/MatchFilter.vue";
import MatchList from "../components/MatchList.vue";
import { getMatchesWithDetails } from "../api/matches";
import { useRouter } from "vue-router";
import MatchPublishDialog from "../components/MatchPublishDialog.vue";
import MatchSignupDialog from "../components/MatchSignupDialog.vue";
// import supabase 查询API

const types = [
  { label: "全部", value: "" },
  { label: "篮球", value: "basketball" },
  { label: "羽毛球", value: "badminton" },
  { label: "气排球", value: "volleyball" },
];
const activeType = ref("");
const matches = ref([]);
const loading = ref(true);
const router = useRouter();
const showPublish = ref(false);
const showSignup = ref(false);
const signupMatchId = ref("");
const userId = localStorage.getItem("qy_user")
  ? JSON.parse(localStorage.getItem("qy_user")).id
  : "";

const fetchMatches = async () => {
  loading.value = true;
  try {
    matches.value = await getMatchesWithDetails(activeType.value);
  } catch (e) {
    matches.value = [];
  }
  loading.value = false;
};

const onTypeChange = (type) => {
  activeType.value = type;
  fetchMatches();
};

const onPublish = () => {
  if (!userId) {
    if (window.confirm("请先登录后再发布赛事")) {
      router.push("/login");
    }
    return;
  }
  showPublish.value = true;
};

const onPublishClose = () => {
  showPublish.value = false;
};

const onPublishSuccess = () => {
  showPublish.value = false;
  fetchMatches();
};

const onSignup = (matchId) => {
  if (!userId) {
    alert("请先登录后再报名");
    return;
  }
  signupMatchId.value = matchId;
  showSignup.value = true;
};

const onSignupClose = () => {
  showSignup.value = false;
};

const onSignupSuccess = () => {
  showSignup.value = false;
  fetchMatches();
};

onMounted(fetchMatches);
</script>

<style scoped>
.match-hall {
  max-width: 700px;
  margin: 0 auto;
  padding: 80px 0 64px 0; /* 顶部留白适配导航栏 */
  min-height: 100vh;
  background: linear-gradient(90deg, #e3f6fc 0%, #f6fafd 100%);
  box-sizing: border-box;
}
.match-hall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  background: linear-gradient(90deg, #3bb2f9 0%, #4ee6c1 100%);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(59, 178, 249, 0.09);
  padding: 18px 22px 14px 22px;
  color: #fff;
}
.match-hall-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}
.publish-btn {
  background: #fff;
  color: #3bb2f9;
  border: none;
  border-radius: 20px;
  padding: 7px 22px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(59, 178, 249, 0.08);
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s, color 0.2s;
}
.publish-btn:hover {
  background: #3bb2f9;
  color: #fff;
  box-shadow: 0 4px 16px rgba(59, 178, 249, 0.18);
}
.loading {
  text-align: center;
  color: #888;
  margin: 32px 0;
}
.empty {
  text-align: center;
  color: #bbb;
  margin: 48px 0;
  font-size: 16px;
}
@media (max-width: 700px) {
  .match-hall {
    max-width: 100vw;
    padding: 72px 0 64px 0;
    border-radius: 0;
  }
  .match-hall-header {
    padding: 14px 10px 10px 16px;
    font-size: 1.1rem;
    border-radius: 0 0 18px 18px;
  }
  .publish-btn {
    padding: 6px 14px;
    font-size: 14px;
  }
}
</style>
