<template>
  <div class="auth-container">
    <h2>登录</h2>
    <form @submit.prevent="onLogin">
      <div class="form-group">
        <label for="login-username">用户名</label>
        <input id="login-username" v-model="username" type="text" required autocomplete="username" />
      </div>
      <div class="form-group">
        <label for="login-password">密码</label>
        <input id="login-password" v-model="password" type="password" required autocomplete="current-password" />
      </div>
      <button type="submit">登录</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const username = ref('')
const password = ref('')

function onLogin() {
  // TODO: 登录逻辑集成
  alert(`登录：${username.value}`)
}
</script>

<style scoped>
.auth-container {
  max-width: 360px;
  margin: 80px auto;
  padding: 2rem 2.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
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
</style>
