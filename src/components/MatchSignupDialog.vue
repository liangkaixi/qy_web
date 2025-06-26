<template>
  <div class="dialog-mask" @click.self="onClose">
    <div class="dialog">
      <div class="dialog-header">
        <span>赛事报名</span>
        <button class="close-btn" @click="onClose">×</button>
      </div>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label>报名类型</label>
          <select v-model="form.signup_type" required>
            <option value="">请选择</option>
            <option value="single">单人拼队</option>
            <option value="team">队伍报名</option>
          </select>
        </div>
        <div
          class="form-group"
          v-if="form.signup_type === 'team' && teams.length"
        >
          <label>选择队伍</label>
          <select v-model="form.team_id" required>
            <option value="">请选择</option>
            <option v-for="t in teams" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>手机号</label>
          <input
            v-model="form.phone"
            required
            maxlength="20"
            placeholder="请输入手机号"
          />
        </div>
        <div class="form-group">
          <label>备注</label>
          <textarea
            v-model="form.remark"
            maxlength="100"
            placeholder="可选"
          ></textarea>
        </div>
        <button class="submit-btn" :disabled="loading">
          {{ loading ? "提交中..." : "提交报名" }}
        </button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import supabase from "../supabase";

const emit = defineEmits(["close", "success"]);
const props = defineProps({ show: Boolean, matchId: String, userId: String });

const form = ref({
  signup_type: "",
  team_id: "",
  phone: "",
  remark: "",
});
const teams = ref([]);
const loading = ref(false);

const onClose = () => emit("close");

const validate = () => {
  if (!form.value.signup_type) return "请选择报名类型";
  if (form.value.signup_type === "team" && !form.value.team_id)
    return "请选择队伍";
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) return "请输入有效手机号";
  return "";
};

const onSubmit = async () => {
  const err = validate();
  if (err) return window.$toast?.error?.(err) || alert(err);
  loading.value = true;
  try {
    const payload = {
      match_id: props.matchId,
      signup_type: form.value.signup_type,
      phone: form.value.phone,
      remark: form.value.remark,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    if (form.value.signup_type === "team") {
      payload.team_id = form.value.team_id;
    } else {
      payload.user_id = props.userId;
    }
    const { error } = await supabase.from("qy_match_signups").insert(payload);
    if (error) throw error;
    window.$toast?.success?.("报名成功") || alert("报名成功");
    emit("success");
    onClose();
  } catch (e) {
    window.$toast?.error?.(e.message || "报名失败") ||
      alert(e.message || "报名失败");
  } finally {
    loading.value = false;
  }
};

const fetchTeams = async () => {
  if (!props.userId) return;
  // 只查当前用户为队长的队伍
  const { data, error } = await supabase
    .from("qy_teams")
    .select("id, name")
    .eq("captain_id", props.userId);
  if (!error) teams.value = data || [];
};

onMounted(fetchTeams);
watch(
  () => props.show,
  (v) => {
    if (v) {
      form.value = { signup_type: "", team_id: "", phone: "", remark: "" };
      fetchTeams();
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
