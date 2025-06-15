<template>
  <nav class="navbar">
    <div class="navbar-left">青沅运动</div>
    <button class="navbar-toggle" @click="toggleMenu" aria-label="展开菜单">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>
    <ul :class="['navbar-right', { open: menuOpen }]">
      <li><a href="#">训练</a></li>
      <li><a href="#">约赛</a></li>
      <li><router-link to="/reservation">场地</router-link></li>
      <li><router-link to="/login">登录</router-link></li>
      <li><router-link to="/register">注册</router-link></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from "vue";
// 响应式菜单开关
const menuOpen = ref(false);
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.navbar-left {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a73e8;
  letter-spacing: 2px;
}
.navbar-right {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
  transition: right 0.3s;
}
.navbar-right li a {
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s;
}
.navbar-right li a:hover {
  color: #1a73e8;
}

/* 移动端样式 */
.navbar-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 1rem;
}
.navbar-toggle .bar {
  width: 24px;
  height: 3px;
  background: #333;
  margin: 3px 0;
  border-radius: 2px;
  transition: all 0.3s;
}
@media (max-width: 768px) {
  .navbar {
    padding: 0 1rem;
  }
  .navbar-right {
    position: fixed;
    top: 64px;
    right: -100vw;
    flex-direction: column;
    background: #fff;
    width: 60vw;
    max-width: 240px;
    height: calc(100vh - 64px);
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
    padding: 2rem 1rem;
    gap: 1.5rem;
    transition: right 0.3s;
  }
  .navbar-right.open {
    right: 0;
  }
  .navbar-toggle {
    display: flex;
  }
}
</style>
