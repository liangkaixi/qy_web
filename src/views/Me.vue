<template>
  <div class="me-page">
    <ProfileHeader
      :name="profile.name"
      :contact="profile.contact"
      :avatar="profile.avatar"
      @edit="onEditProfile"
    />
    <ProfileMenu :menu="menuList" @select="onMenuSelect" />
    <button class="logout-btn" @click="logout">退出登录</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ProfileHeader from "@/components/ProfileHeader.vue";
import ProfileMenu from "@/components/ProfileMenu.vue";
import { useRouter } from "vue-router";
import supabase from "@/supabase";

const router = useRouter();
const profile = ref({ name: "", contact: "", avatar: "" });
const menuList = [
  { key: "signup", label: "我的报名", icon: "📝" },
  { key: "reservation", label: "我的预约", icon: "📅" },
  { key: "match", label: "我的比赛", icon: "🏆" },
  { key: "team", label: "我的球队", icon: "👥" },
  { key: "points", label: "我的积分", icon: "💎" },
  { key: "coupon", label: "优惠券", icon: "🎫" },
  { key: "service", label: "微信客服", icon: "💬" },
  { key: "feedback", label: "意见反馈", icon: "🗣️" },
  { key: "notice", label: "公告", icon: "📢" },
];

onMounted(async () => {
  const u = localStorage.getItem("qy_user");
  const user = u ? JSON.parse(u) : null;
  if (user && user.id) {
    const { data } = await supabase
      .from("qy_user_profiles")
      .select("name, contact, avatar")
      .eq("id", user.id)
      .single();
    if (data) profile.value = data;
  }
});

function onEditProfile() {
  // 跳转到资料编辑页或弹窗
  router.push("/me/edit");
}
function onMenuSelect(key) {
  switch (key) {
    case "signup":
      router.push("/my-signups");
      break;
    case "reservation":
      router.push("/my_reservations");
      break;
    case "match":
      router.push("/my-matches");
      break;
    case "team":
      router.push("/my-teams");
      break;
    case "points":
      router.push("/my-points");
      break;
    case "coupon":
      router.push("/my-coupons");
      break;
    case "service":
      window.open("https://weixin.qq.com/", "_blank");
      break;
    case "feedback":
      router.push("/feedback");
      break;
    case "notice":
      router.push("/notices");
      break;
  }
}
function logout() {
  localStorage.removeItem("qy_user");
  localStorage.removeItem("qy_profile");
  supabase.auth.signOut();
  router.push("/login");
}
</script>

<style scoped>
.me-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 0.5rem 2.5rem 0.5rem;
}
.logout-btn {
  width: 100%;
  margin: 1.5rem 0 0 0;
  background: linear-gradient(90deg, #1a73e8 0%, #34d399 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 0.9rem 0;
  font-size: 1.15rem;
  font-weight: bold;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}
.logout-btn:active {
  background: #1761c6;
}
</style>
