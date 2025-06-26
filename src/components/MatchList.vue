<template>
  <div class="match-list">
    <MatchCard
      v-for="match in matches"
      :key="match.id"
      :match="match"
      @signup="$emit('signup', match.id)"
    />
  </div>
</template>
<script setup>
import MatchCard from "./MatchCard.vue";
defineProps({
  matches: Array,
});
</script>
<style scoped>
.match-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
