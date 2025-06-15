<template>
  <div class="sport-page">
    <h1>体适能</h1>
    <div class="sport-features">
      <div class="feature-block">训练</div>
    </div>
  </div>
</template>

<script setup>
// 预留后续逻辑
</script>

<style scoped>
.sport-page {
  max-width: 900px;
  margin: 48px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  padding: 2rem 2.5rem;
}
h1 {
  color: #1a73e8;
  margin-bottom: 2rem;
  text-align: center;
}
.sport-features {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}
.feature-block {
  min-width: 120px;
  background: #f5f8fe;
  border-radius: 8px;
  padding: 1.2rem 2rem;
  font-size: 1.2rem;
  color: #1a73e8;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 1px 6px rgba(26,115,232,0.06);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}
.feature-block:hover {
  box-shadow: 0 4px 24px rgba(26,115,232,0.10);
  transform: translateY(-4px) scale(1.04);
}
</style>
