<template>
  <div class="my-teams-container">
    <h2>我的球队</h2>
    <div class="team-list-empty">暂无球队，快去创建或加入吧！</div>
    <!-- 这里后续可展示球队卡片、创建/加入按钮等 -->
  </div>
</template>

<script setup>
// 预留后续功能
</script>

<style scoped>
.my-teams-container {
  max-width: 700px;
  margin: 60px auto 0 auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(26, 115, 232, 0.1);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
h2 {
  color: #1a73e8;
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 800;
  letter-spacing: 2px;
}
.team-list-empty {
  color: #888;
  font-size: 1.2rem;
  margin-top: 2.5rem;
  text-align: center;
}
</style>
