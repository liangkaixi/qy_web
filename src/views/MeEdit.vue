<template>
  <div class="me-edit-page">
    <h2>编辑个人资料</h2>
    <div class="avatar-upload">
      <label>头像</label>
      <div class="avatar-preview" @click="triggerAvatarInput">
        <img v-if="profile.avatar" :src="profile.avatar" class="avatar" />
        <span v-else class="avatar-plus">+</span>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          @change="onAvatarChange"
          style="display: none"
        />
      </div>
    </div>
    <div class="form-group">
      <label>昵称</label>
      <input v-model="profile.name" placeholder="请输入昵称" />
    </div>
    <div class="form-group">
      <label>联系方式</label>
      <input v-model="profile.contact" placeholder="请输入手机号或微信号" />
    </div>
    <button class="save-btn" @click="saveProfile" :disabled="saving">
      {{ saving ? "保存中..." : "保存" }}
    </button>
    <button class="cancel-btn" @click="goBack">取消</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import supabase from "@/supabase";

const router = useRouter();
const profile = ref({ name: "", contact: "", avatar: "" });
const avatarInput = ref(null);
const saving = ref(false);

onMounted(async () => {
  const u = localStorage.getItem("qy_user");
  const user = u ? JSON.parse(u) : null;
  if (user && user.id) {
    const { data } = await supabase
      .from("qy_user_profiles")
      .select("name, contact, avatar")
      .eq("id", user.id)
      .single();
    if (data) profile.value = data;
  }
});

function triggerAvatarInput() {
  avatarInput.value && avatarInput.value.click();
}

async function onAvatarChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const u = localStorage.getItem("qy_user");
  const user = u ? JSON.parse(u) : null;
  if (!user || !user.id) {
    alert("请先登录");
    return;
  }
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}_${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("avatar")
    .upload(fileName, file, { cacheControl: "3600", upsert: true });
  if (error) {
    alert("上传失败: " + error.message);
    return;
  }
  const publicUrl = `${
    import.meta.env.VITE_SUPABASE_URL
  }/storage/v1/object/public/avatar/${fileName}`;
  profile.value.avatar = publicUrl;
}

async function saveProfile() {
  saving.value = true;
  const u = localStorage.getItem("qy_user");
  const user = u ? JSON.parse(u) : null;
  if (!user || !user.id) {
    alert("请先登录");
    saving.value = false;
    return;
  }
  // 1. 保存到 qy_user_profiles
  await supabase
    .from("qy_user_profiles")
    .upsert([
      {
        id: user.id,
        name: profile.value.name,
        contact: profile.value.contact,
        avatar: profile.value.avatar,
      },
    ]);
  // 2. 同步到 qy_users
  await supabase
    .from("qy_users")
    .update({ avatar_url: profile.value.avatar })
    .eq("id", user.id);
  saving.value = false;
  alert("保存成功！");
  router.push("/me");
}
function goBack() {
  router.push("/me");
}
</script>

<style scoped>
.me-edit-page {
  max-width: 400px;
  margin: 2.5rem auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(52, 211, 153, 0.09);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.me-edit-page h2 {
  color: #1a73e8;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
  text-align: center;
}
.avatar-upload label {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.3rem;
  display: block;
}
.avatar-preview {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.2rem;
  cursor: pointer;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.13);
}
.avatar-plus {
  width: 72px;
  height: 72px;
  font-size: 2.2rem;
  color: #409eff;
  background: #e3eefe;
  border: 2px dashed #b2ebf2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-group {
  margin-bottom: 1.1rem;
}
.form-group label {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.3rem;
  display: block;
}
.form-group input {
  width: 100%;
  padding: 0.7em 1em;
  border: 2px solid #b2ebf2;
  border-radius: 10px;
  font-size: 1.08rem;
  background: #f6f8fa;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-group input:focus {
  border-color: #409eff;
  outline: none;
}
.save-btn {
  width: 100%;
  padding: 0.9rem 0;
  background: linear-gradient(90deg, #1a73e8 0%, #34d399 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 1.15rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0.7rem;
  transition: box-shadow 0.2s, transform 0.2s;
}
.save-btn:active {
  background: #1761c6;
}
.cancel-btn {
  width: 100%;
  padding: 0.7rem 0;
  background: #e3eefe;
  color: #1a73e8;
  border: none;
  border-radius: 14px;
  font-size: 1.08rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.cancel-btn:active {
  background: #b2ebf2;
}
</style>
