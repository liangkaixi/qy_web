<template>
  <div class="me-page">
    <!-- 侧边栏 -->
    <div class="me-sidebar">
      <div class="me-avatar-section" @click="triggerAvatarInput">
        <img v-if="avatarUrl" :src="avatarUrl" class="me-avatar" />
        <span v-else class="me-avatar-plus">+</span>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              @change="onAvatarChange"
              style="display: none"
            />
          </div>
      <div class="me-nickname">{{ profile.name || "未设置昵称" }}</div>
      <nav class="me-menu">
        <router-link to="/me" class="me-menu-item" active-class="active">
          个人中心
          </router-link>
        <router-link to="/my-teams" class="me-menu-item" active-class="active">
          我的球队
          </router-link>
        <router-link
          to="/my-matches"
          class="me-menu-item"
          active-class="active"
        >
          我的比赛
          </router-link>
        <router-link to="/settings" class="me-menu-item" active-class="active">
          系统设置
          </router-link>
        </nav>
      </div>
      <!-- 右侧内容区 -->
    <div class="me-main">
        <div v-if="user">
        <form class="me-info-form" @submit.prevent="saveProfile">
            <h2>个人中心</h2>
          <label>姓名</label>
              <input v-model="profile.name" placeholder="请输入姓名" />
          <label>联系方式</label>
              <input v-model="profile.contact" placeholder="手机号或邮箱" />
          <label>邮箱</label>
              <input :value="user.email" disabled />
          <label>用户ID</label>
              <input :value="user.id" disabled />
          <button type="submit">保存</button>
        </form>
        </div>
        <div v-else>
          <p>未登录，请先登录。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import supabase from "@/supabase";

const user = ref(null);
const avatarUrl = ref("");
const profile = ref({ name: "", contact: "", avatar: "" });
const avatarInput = ref(null);
const router = useRouter();

onMounted(async () => {
  const u = localStorage.getItem("qy_user");
  user.value = u ? JSON.parse(u) : null;
  if (user.value && user.value.id) {
    const { data } = await supabase
      .from("qy_user_profiles")
      .select("name, contact, avatar")
      .eq("id", user.value.id)
      .single();
    if (data) {
      profile.value = data;
      avatarUrl.value = data.avatar || "";
    }
  }
  const p = localStorage.getItem("qy_profile");
  if (p && !profile.value.name) {
    const parsed = JSON.parse(p);
    profile.value = parsed;
    avatarUrl.value = parsed.avatar || "";
  }
});

function triggerAvatarInput() {
  avatarInput.value && avatarInput.value.click();
}

async function onAvatarChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!user.value || !user.value.id) {
    alert("请先登录");
    return;
  }
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.value.id}_${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("avatar")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });
  if (error) {
    alert("上传失败: " + error.message);
    return;
  }
  const publicUrl = `${
    import.meta.env.VITE_SUPABASE_URL
  }/storage/v1/object/public/avatar/${fileName}`;
  avatarUrl.value = publicUrl;
  profile.value.avatar = publicUrl;
}

async function saveProfile() {
  profile.value.avatar = avatarUrl.value;
  if (!user.value || !user.value.id) {
    alert("请先登录");
    return;
  }
  const { error } = await supabase.from("qy_user_profiles").upsert([
    {
      id: user.value.id,
      name: profile.value.name,
      contact: profile.value.contact,
      avatar: profile.value.avatar,
    },
  ]);
  if (error) {
    alert("保存到数据库失败: " + error.message);
    return;
  }
  localStorage.setItem("qy_profile", JSON.stringify(profile.value));
  router.push("/me");
}
</script>

<style scoped>
/* 全局防止溢出 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* ======= 主容器 ======= */
.me-page {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 0;
  padding-top: 64px; /* 顶部导航条高度 */
  min-height: 100vh;
  box-sizing: border-box;
  align-items: stretch;
}

/* ======= 侧边栏 ======= */
.me-sidebar {
  width: 260px;
  min-width: 180px;
  background: #fff;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.08);
  padding: 48px 0 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}
.me-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin-bottom: 12px;
}
.me-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.13);
  margin-bottom: 8px;
}
.me-avatar-plus {
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
  box-shadow: none;
  margin-bottom: 8px;
}
.me-nickname {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 18px;
}
.me-menu {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.me-menu-item {
  padding: 12px 32px;
  color: #24292f;
  font-size: 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  display: block;
}
.me-menu-item.active,
.me-menu-item:hover {
  background: #eaecef;
  font-weight: 600;
}

/* ======= 内容区 ======= */
.me-main {
  flex: 1;
  min-width: 0;
  max-width: 600px;
  background: #fff;
  border-radius: 0 20px 20px 0;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.08);
  padding: 40px 36px 32px 36px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
  padding-top: 48px;
}
.me-info-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.me-info-form h2 {
  color: #1a73e8;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 28px;
  text-align: center;
}
.me-info-form label {
  font-size: 1rem;
  color: #57606a;
  font-weight: 600;
  margin-bottom: 6px;
}
.me-info-form input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #b2ebf2;
  border-radius: 10px;
  font-size: 1.08rem;
  margin-bottom: 18px;
  background: #f6f8fa;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.me-info-form input:focus {
  border-color: #409eff;
  outline: none;
}
.me-info-form input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
  color: #b0b0b0;
}
.me-info-form button {
  width: 100%;
  padding: 14px 0;
  background: linear-gradient(90deg, #2da44e 60%, #2188ff 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(33, 136, 255, 0.08);
  transition: background 0.2s, transform 0.15s;
  letter-spacing: 1px;
}
.me-info-form button:hover {
  background: linear-gradient(90deg, #2188ff 60%, #2da44e 100%);
  transform: translateY(-2px) scale(1.03);
}

/* ======= 移动端适配 ======= */
@media (max-width: 900px) {
  .me-page,
  .me-main,
  .me-sidebar,
  .me-info-form {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .me-page {
    flex-direction: column;
    align-items: center;
    gap: 0;
    padding-top: 56px;
  }
  .me-sidebar {
    border-radius: 0;
    margin: 0 0 12px 0;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow-x: auto;
    padding-top: 56px !important;
  }
  .me-avatar-section {
    flex-direction: row;
    margin: 0 12px 0 16px;
  }
  .me-avatar,
  .me-avatar-plus {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
    margin-bottom: 0;
  }
  .me-nickname {
    font-size: 1rem;
    margin: 0 12px 0 0;
  }
  .me-menu {
    flex-direction: row;
    gap: 0;
    width: auto;
  }
  .me-menu-item {
    padding: 8px 14px;
    font-size: 0.95rem;
    border-radius: 8px;
    white-space: nowrap;
  }
  .me-info-form {
    padding: 18px 12px 12px 12px !important;
  }
  .me-main {
    padding-top: 32px !important;
  }
}
@media (max-width: 600px) {
  .me-info-form {
    padding: 10px 6px 8px 6px !important;
  }
  .me-avatar,
  .me-avatar-plus {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  .me-nickname {
    font-size: 0.9rem;
  }
  .me-menu-item {
    font-size: 0.85rem;
    padding: 6px 6px;
  }
  .me-main {
    padding-top: 20px !important;
  }
  .me-sidebar {
    padding-top: 48px !important;
  }
}
</style>
