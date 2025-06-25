<template>
  <div class="profile-header">
    <div class="avatar-section" @click="onEdit">
      <img v-if="avatar" :src="avatar" class="avatar" />
      <span v-else class="avatar-plus">+</span>
    </div>
    <div class="info-section">
      <div class="nickname">{{ name || "未设置昵称" }}</div>
      <div class="contact">{{ contact || "未设置联系方式" }}</div>
    </div>
    <button class="edit-btn" @click="onEdit">编辑资料</button>
  </div>
</template>

<script setup>
const props = defineProps({
  name: String,
  contact: String,
  avatar: String,
});
const emit = defineEmits(["edit"]);
function onEdit() {
  emit("edit");
}
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  padding: 1.2rem 1.5rem 1.2rem 1.2rem;
  background: linear-gradient(90deg, #1a73e8 0%, #34d399 100%);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(52, 211, 153, 0.09);
  margin-bottom: 1.2rem;
}
.avatar-section {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.2rem;
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
.info-section {
  flex: 1;
}
.nickname {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 0.3rem;
}
.contact {
  font-size: 1rem;
  color: #e0f2fe;
}
.edit-btn {
  background: #fff;
  color: #1a73e8;
  border: none;
  border-radius: 8px;
  padding: 0.5em 1.2em;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-left: 1.2rem;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #e3f6fc;
}
</style>
