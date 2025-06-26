<template>
  <div class="floating-signup-bar">
    <div class="bar-content">
      <span class="promo-text">39.9元领取4节体验课</span>
      <input
        v-model="phone"
        class="phone-input"
        type="tel"
        maxlength="11"
        placeholder="请输入手机号"
        :disabled="loading"
        @keyup.enter="onSignup"
      />
      <button class="signup-btn" :disabled="loading" @click="onSignup">
        {{ loading ? "提交中..." : "立即领取" }}
      </button>
    </div>
    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { submitTrialSignup, checkPhoneExists } from "@/api/trialSignups";

const phone = ref("");
const loading = ref(false);
const toast = ref("");

function isValidPhone(val) {
  return /^1[3-9]\d{9}$/.test(val);
}

async function onSignup() {
  if (loading.value) return;
  if (!isValidPhone(phone.value)) {
    showToast("请输入正确的手机号");
    return;
  }
  loading.value = true;
  try {
    const exists = await checkPhoneExists(phone.value);
    if (exists) {
      showToast("该手机号已领取体验课");
      loading.value = false;
      return;
    }
    const { error } = await submitTrialSignup(phone.value);
    if (error) {
      showToast("提交失败，请稍后重试");
    } else {
      showToast("领取成功！工作人员将尽快联系您");
      phone.value = "";
    }
  } catch (e) {
    showToast("网络异常，请稍后重试");
  }
  loading.value = false;
}

function showToast(msg) {
  toast.value = msg;
  setTimeout(() => {
    toast.value = "";
  }, 2200);
}
</script>

<style>
.floating-signup-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: #555;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  padding: 0.7em 0;
}
.bar-content {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1em;
  justify-content: center;
}
.promo-text {
  color: #fff;
  font-size: 1.1em;
  font-weight: 600;
  margin-right: 0.7em;
}
.phone-input {
  border: none;
  border-radius: 2em;
  padding: 0.6em 1.2em;
  font-size: 1em;
  outline: none;
  width: 170px;
  margin-right: 0.5em;
}
.signup-btn {
  background: linear-gradient(90deg, #1a73e8 0%, #34d399 100%);
  color: #fff;
  border: none;
  border-radius: 2em;
  font-size: 1.08em;
  font-weight: bold;
  padding: 0.6em 2.2em;
  cursor: pointer;
  transition: background 0.2s;
}
.signup-btn:disabled {
  background: #b0c4d8;
  color: #eee;
  cursor: not-allowed;
}
.signup-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #1760c4 0%, #2bb98a 100%);
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 4.5em;
  transform: translateX(-50%);
  background: rgba(34, 34, 34, 0.95);
  color: #fff;
  padding: 0.7em 1.5em;
  border-radius: 1.5em;
  font-size: 1em;
  z-index: 2000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.13);
  pointer-events: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 600px) {
  .bar-content {
    flex-direction: column;
    gap: 0.5em;
  }
  .phone-input {
    width: 100%;
    margin-right: 0;
  }
  .signup-btn {
    width: 100%;
  }
}
</style>
