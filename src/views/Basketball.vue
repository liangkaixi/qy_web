<template>
  <div class="sport-page">
    <h1>篮球</h1>
    <div class="sport-features">
      <div class="feature-block" @click="goReserve">定场地</div>
      <div class="feature-block">约比赛</div>
      <div class="feature-block">参加比赛</div>
      <div class="feature-block">训练</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
function goReserve() {
  router.push("/reservation");
}
</script>

<style scoped>
.sport-page {
  max-width: 900px;
  min-height: 60vh;
  margin: 64px auto 48px auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(26, 115, 232, 0.1);
  padding: 3rem 3.5rem 2.5rem 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
h1 {
  color: #1a73e8;
  margin-bottom: 2.5rem;
  text-align: center;
  font-size: 2.3rem;
  font-weight: 700;
  letter-spacing: 2px;
}
.sport-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.2rem 3.2rem;
  width: 100%;
  justify-items: center;
  align-items: center;
}
.feature-block {
  min-width: 160px;
  background: #f5f8fe;
  border-radius: 12px;
  padding: 2rem 0.5rem;
  font-size: 1.25rem;
  color: #1a73e8;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 2px 12px rgba(26, 115, 232, 0.06);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
  user-select: none;
}
.feature-block:hover {
  box-shadow: 0 8px 32px rgba(26, 115, 232, 0.13);
  transform: translateY(-6px) scale(1.05);
  background: #e3eefe;
}
@media (max-width: 1100px) {
  .sport-page {
    max-width: 98vw;
    padding: 2rem 0.5rem 1.5rem 0.5rem;
  }
  .sport-features {
    gap: 1.2rem 1.2rem;
  }
}
@media (max-width: 700px) {
  .sport-page {
    min-height: 0;
    margin: 32px auto 16px auto;
    border-radius: 10px;
    padding: 1.2rem 0.5rem;
  }
  .sport-features {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .feature-block {
    min-width: 0;
    width: 100%;
    padding: 1.2rem 0.5rem;
    font-size: 1.05rem;
    border-radius: 7px;
  }
  h1 {
    font-size: 1.3rem;
  }
}
</style>
