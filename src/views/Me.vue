<template>
  <div class="me-container">
    <div class="me-layout">
      <!-- 左侧导航栏 -->
      <div class="nav-sidebar">
        <div class="nav-header">
          <div class="avatar-section" @click="triggerAvatarInput">
            <div class="avatar-wrapper">
              <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" />
              <span v-else class="avatar-plus avatar-plus-large">+</span>
            </div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              @change="onAvatarChange"
              style="display: none"
            />
          </div>
          <h3 v-if="profile.name">{{ profile.name }}</h3>
          <h3 v-else>未设置昵称</h3>
        </div>
        <nav class="nav-menu">
          <router-link to="/me" class="nav-item" active-class="active">
            <i class="nav-icon">👤</i>
            <span>个人中心</span>
          </router-link>
          <router-link to="/my-teams" class="nav-item" active-class="active">
            <i class="nav-icon">🏃</i>
            <span>我的球队</span>
          </router-link>
          <router-link to="/my-matches" class="nav-item" active-class="active">
            <i class="nav-icon">⚽</i>
            <span>我的比赛</span>
          </router-link>
          <router-link to="/settings" class="nav-item" active-class="active">
            <i class="nav-icon">⚙️</i>
            <span>系统设置</span>
          </router-link>
        </nav>
      </div>

      <!-- 右侧内容区 -->
      <div class="content-area">
        <div v-if="user">
          <div class="user-info-form">
            <h2>个人中心</h2>
            <div class="form-group">
              <label>姓名：</label>
              <input v-model="profile.name" placeholder="请输入姓名" />
            </div>
            <div class="form-group">
              <label>联系方式：</label>
              <input v-model="profile.contact" placeholder="手机号或邮箱" />
            </div>
            <div class="form-group">
              <label>邮箱：</label>
              <input :value="user.email" disabled />
            </div>
            <div class="form-group">
              <label>用户ID：</label>
              <input :value="user.id" disabled />
            </div>
            <button class="save-btn" @click="saveProfile">保存</button>
          </div>
        </div>
        <div v-else>
          <p>未登录，请先登录。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import supabase from "@/supabase";

const user = ref(null);
const defaultAvatar =
  "https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/static/live2d-widget-models/live2d-widget-model-shizuku/assets/texture_00.png";
const avatarUrl = ref("");
const profile = ref({ name: "", contact: "", avatar: "" });
const avatarInput = ref(null);
const router = useRouter();

onMounted(async () => {
  const u = localStorage.getItem("qy_user");
  user.value = u ? JSON.parse(u) : null;

  // 拉取数据库中的 profile，使用 supabase-js 推荐写法
  if (user.value && user.value.id) {
    const { data, error } = await supabase
      .from("qy_user_profiles")
      .select("name, contact, avatar")
      .eq("id", user.value.id)
      .single();
    if (data) {
      profile.value = data;
      avatarUrl.value = data.avatar || "";
    }
  }
  // 本地兜底
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

  const { data, error } = await supabase.storage
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
  // 保存到 Supabase 数据库
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
  // 本地也同步保存
  localStorage.setItem("qy_profile", JSON.stringify(profile.value));
  router.push("/me");
}
</script>

<style scoped>
.me-container {
  min-height: 100vh;
  background: linear-gradient(120deg, #e3eefe 0%, #b2ebf2 100%);
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.me-layout {
  width: 100%;
  max-width: 1050px;
  min-width: 800px;
  margin: 64px auto 32px auto;
  display: flex;
  gap: 0;
  background: transparent;
  border-radius: 24px;
  box-shadow: none;
  min-height: calc(100vh - 64px - 32px - 56px);
}

.nav-sidebar {
  width: 220px;
  min-width: 180px;
  background: #fff;
  border-radius: 24px 0 0 24px;
  box-shadow: 0 4px 24px rgba(64, 158, 255, 0.1);
  padding: 32px 0 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-header {
  padding: 0 16px 32px 16px;
  border-bottom: 1.5px solid #e3eefe;
  margin-bottom: 32px;
  text-align: center;
}

.nav-header h3 {
  margin-top: 16px;
  color: #1a73e8;
  font-size: 1.15rem;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 14px 32px;
  color: #64748b;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 14px;
  border-radius: 12px 0 0 12px;
  font-size: 1.08rem;
  font-weight: 500;
}

.nav-item:hover {
  background: linear-gradient(90deg, #e3eefe 60%, #b2ebf2 100%);
  color: #1a73e8;
  transform: translateX(4px) scale(1.03);
}

.nav-item.active {
  background: linear-gradient(90deg, #409eff 60%, #67c23a 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.nav-icon {
  font-size: 1.25rem;
}

.content-area {
  flex: 1;
  background: #fff;
  border-radius: 0 24px 24px 0;
  box-shadow: 0 4px 24px rgba(64, 158, 255, 0.1);
  padding: 48px 48px 32px 48px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.user-info-form {
  width: 100%;
  background: rgba(236, 248, 255, 0.7);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.08);
  padding: 32px 28px 24px 28px;
  margin-left: 0;
  margin-right: auto;
}

.user-info-form h2 {
  color: #1a73e8;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 28px;
  text-align: center;
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  font-size: 1rem;
  color: #1a73e8;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #b2ebf2;
  border-radius: 10px;
  font-size: 1.08rem;
  transition: border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;
  background: #fff;
}

.form-group input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px #b2ebf2;
  outline: none;
}

.form-group input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
  color: #b0b0b0;
}

.save-btn {
  margin-top: 28px;
  background: linear-gradient(90deg, #409eff 60%, #67c23a 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 14px 0;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s, transform 0.15s;
  width: 100%;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
  letter-spacing: 1px;
}

.save-btn:hover {
  background: linear-gradient(90deg, #67c23a 60%, #409eff 100%);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.18);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  width: 88px;
  height: 88px;
}

.avatar-img {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.13);
  display: block;
}

.avatar-plus {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.2rem;
  color: #fff;
  background: #409eff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.18);
  border: 3px solid #fff;
  pointer-events: none;
  opacity: 0.92;
}

.avatar-plus-large {
  width: 88px;
  height: 88px;
  font-size: 3.2rem;
  background: #e3eefe;
  color: #409eff;
  border: 2px dashed #b2ebf2;
  border-radius: 50%;
  box-shadow: none;
  border-width: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .me-layout {
    margin: 18px 0 10px 0;
    min-width: 0;
    min-height: unset;
  }
  .nav-sidebar {
    width: 100%;
    min-width: 0;
    border-radius: 24px 24px 0 0;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 18px 0 10px 0;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    border-right: none;
    border-bottom: 1.5px solid #e3eefe;
  }
  .nav-menu {
    flex-direction: row;
    gap: 0;
    width: auto;
    margin-top: 0;
    margin-left: 24px;
  }
  .nav-item {
    border-radius: 10px 10px 0 0;
    padding: 10px 18px;
    font-size: 1rem;
  }
  .content-area {
    border-radius: 0 0 24px 24px;
    padding: 24px 8vw 18px 8vw;
    min-width: 0;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  }
  .user-info-form {
    padding: 18px 8px 12px 8px;
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .me-layout {
    margin: 0;
    border-radius: 0;
  }
  .content-area {
    padding: 12px 2vw 8px 2vw;
    border-radius: 0 0 18px 18px;
  }
  .user-info-form {
    padding: 10px 2px 8px 2px;
    border-radius: 10px;
  }
}
</style>
