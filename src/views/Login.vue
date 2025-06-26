<template>
  <div class="auth-container">
    <h2>登录</h2>
    <form @submit.prevent="onLogin">
      <div class="form-group">
        <label for="login-username">用户名</label>
        <input
          id="login-username"
          v-model="username"
          type="text"
          required
          autocomplete="username"
        />
      </div>
      <div class="form-group">
        <label for="login-password">密码</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />
      </div>
      <button type="submit">登录</button>
    </form>
    <div class="register-tip">
      没有账号？
      <button type="button" class="register-btn" @click="goRegister">
        注册
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import supabase from "../supabase";
const username = ref("");
const password = ref("");
const router = useRouter();

function goRegister() {
  router.push("/register");
}

async function onLogin() {
  if (!username.value || !password.value) {
    alert("请输入用户名和密码");
    return;
  }
  const { error, data } = await supabase.auth.signInWithPassword({
    email: username.value,
    password: password.value,
  });
  if (error) {
    alert("登录失败：" + error.message);
    return;
  }
  // 自动同步用户到 qy_users 表
  const user = data.user;
  if (user) {
    await supabase.from("qy_users").upsert({
      id: user.id,
      openid: user.id, // 以 auth.users.id 作为 openid
      nickname: user.user_metadata?.full_name || user.email || user.id,
      avatar_url: user.user_metadata?.avatar_url || "",
      gender: 0,
      city: "",
      province: "",
      country: "",
    });
  }
  // 存储用户信息到localStorage
  localStorage.setItem("qy_user", JSON.stringify(user));
  // 跳转首页
  router.push("/");
}
</script>

<style scoped>
.auth-container {
  max-width: 360px;
  margin: 80px auto;
  padding: 2rem 2.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}
h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #1a73e8;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}
input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
input:focus {
  border-color: #1a73e8;
}
button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
button[type="submit"]:hover {
  background: #1761c6;
}
.register-tip {
  text-align: center;
  margin-top: 1.2rem;
  color: #666;
  font-size: 0.98em;
}
.register-btn {
  background: none;
  border: none;
  color: #1a73e8;
  font-weight: bold;
  cursor: pointer;
  margin-left: 0.3em;
  font-size: 1em;
  padding: 0;
  transition: color 0.2s;
}
.register-btn:hover {
  color: #1761c6;
  text-decoration: underline;
}
</style>
