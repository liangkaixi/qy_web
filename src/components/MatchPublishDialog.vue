<template>
  <div class="dialog-mask" @click.self="onClose">
    <div class="dialog">
      <div class="dialog-header">
        <span>发布赛事</span>
        <button class="close-btn" @click="onClose">×</button>
      </div>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label>运动类型</label>
          <select
            v-model="form.sport_type"
            required
            @change="onSportTypeChange"
          >
            <option value="">请选择</option>
            <option value="basketball">篮球</option>
            <option value="badminton">羽毛球</option>
            <option value="volleyball">气排球</option>
          </select>
        </div>
        <div class="form-group" v-if="groupOptions.length">
          <label>分组/分区</label>
          <select v-model="form.group_type" required>
            <option value="">请选择</option>
            <option
              v-for="opt in groupOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>赛事名称</label>
          <input
            v-model="form.title"
            required
            maxlength="30"
            placeholder="请输入赛事名称"
          />
        </div>
        <div class="form-group">
          <label>比赛时间</label>
          <input v-model="form.match_time" type="datetime-local" required />
        </div>
        <div class="form-group">
          <label>场馆</label>
          <select v-model="form.venue_id" required @change="onVenueChange">
            <option value="">请选择</option>
            <option v-for="v in venues" :key="v.id" :value="v.id">
              {{ v.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>场地</label>
          <select v-model="form.court_id" required :disabled="!courts.length">
            <option value="">请选择</option>
            <option v-for="c in courts" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>简介/规则</label>
          <textarea
            v-model="form.description"
            maxlength="200"
            placeholder="可选，最多200字"
          ></textarea>
        </div>
        <div class="form-group">
          <label>报名截止时间</label>
          <input v-model="form.signup_deadline" type="date" />
        </div>
        <button class="submit-btn" :disabled="loading">
          {{ loading ? "提交中..." : "发布赛事" }}
        </button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import { getVenues } from "../api/venues";
import { getCourtsByVenue } from "../api/courts";
import supabase from "../supabase";

const emit = defineEmits(["close", "success"]);
const props = defineProps({ show: Boolean });

const groupOptionsMap = {
  basketball: [
    { label: "单挑", value: "单挑" },
    { label: "半场", value: "半场" },
    { label: "全场", value: "全场" },
  ],
  badminton: [
    { label: "男子单打", value: "男子单打" },
    { label: "女子单打", value: "女子单打" },
    { label: "男子双打", value: "男子双打" },
    { label: "女子双打", value: "女子双打" },
    { label: "混合双打", value: "混合双打" },
  ],
  volleyball: [
    { label: "纯男", value: "纯男" },
    { label: "纯女", value: "纯女" },
    { label: "混合", value: "混合" },
    { label: "自由组合", value: "自由组合" },
  ],
};
const groupOptions = ref([]);
const onSportTypeChange = () => {
  form.value.group_type = "";
  groupOptions.value = groupOptionsMap[form.value.sport_type] || [];
};

const form = ref({
  title: "",
  sport_type: "",
  group_type: "",
  match_time: "",
  venue_id: "",
  court_id: "",
  description: "",
  signup_deadline: "",
});
const venues = ref([]);
const courts = ref([]);
const loading = ref(false);

const onClose = () => emit("close");

const onVenueChange = async () => {
  form.value.court_id = "";
  if (!form.value.venue_id) {
    courts.value = [];
    return;
  }
  courts.value = await getCourtsByVenue(form.value.venue_id);
};

const validate = () => {
  if (!form.value.sport_type) return "请选择运动类型";
  if (!form.value.group_type) return "请选择分组/分区";
  if (!form.value.title.trim()) return "请输入赛事名称";
  if (!form.value.match_time) return "请选择比赛时间";
  if (!form.value.venue_id) return "请选择场馆";
  if (!form.value.court_id) return "请选择场地";
  if (new Date(form.value.match_time) < new Date())
    return "比赛时间不能早于当前";
  return "";
};

const onSubmit = async () => {
  const err = validate();
  if (err) return window.$toast?.error?.(err) || alert(err);
  loading.value = true;
  try {
    // 获取当前登录用户id
    const user = localStorage.getItem("qy_user")
      ? JSON.parse(localStorage.getItem("qy_user"))
      : null;
    const creator_id = user?.id || null;
    const { error } = await supabase.from("qy_matches").insert({
      title: form.value.title,
      sport_type: form.value.sport_type,
      group_type: form.value.group_type,
      match_time: form.value.match_time,
      venue_id: form.value.venue_id,
      court_id: form.value.court_id,
      status: "pending",
      description: form.value.description,
      signup_deadline: form.value.signup_deadline,
      creator_id,
    });
    if (error) throw error;
    window.$toast?.success?.("发布成功") || alert("发布成功");
    emit("success");
    onClose();
  } catch (e) {
    window.$toast?.error?.(e.message || "发布失败") ||
      alert(e.message || "发布失败");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  venues.value = await getVenues();
});
watch(
  () => props.show,
  (v) => {
    if (v) {
      // 重置表单
      form.value = {
        title: "",
        sport_type: "",
        group_type: "",
        match_time: "",
        venue_id: "",
        court_id: "",
        description: "",
        signup_deadline: "",
      };
      groupOptions.value = [];
      courts.value = [];
    }
  }
);
</script>
<style scoped>
.dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(59, 178, 249, 0.13);
  width: 95vw;
  max-width: 400px;
  padding: 24px 18px 18px 18px;
  position: relative;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: #bbb;
  cursor: pointer;
}
.form-group {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
input,
select,
textarea {
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  padding: 7px 10px;
  font-size: 15px;
  outline: none;
  transition: border 0.2s;
}
input:focus,
select:focus,
textarea:focus {
  border-color: #3bb2f9;
}
.submit-btn {
  width: 100%;
  background: linear-gradient(90deg, #3bb2f9, #4ee6c1);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 10px 0;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
