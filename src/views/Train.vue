<template>
  <div class="train-page">
    <!-- 顶部横幅广告图 -->
    <div class="train-banner">
      <img
        src="@/assets/swiper/banner1.png"
        alt="沪溪青沄篮球馆暑假班"
        class="banner-img"
      />
      <div class="banner-title">沪溪青沄篮球馆</div>
      <div class="banner-sub">暑假提升·最佳时机！</div>
    </div>

    <div class="train-main">
      <!-- 课程亮点区 -->
      <div class="card-block">
        <div class="highlight-title">课程亮点</div>
        <ul>
          <li>博士生亲授，科学训练体系</li>
          <li>小班制分龄教学，因材施教</li>
          <li>暑期特惠，赠送球衣/装备</li>
          <li>多功能场馆，环境舒适</li>
        </ul>
      </div>

      <!-- 课程价格表区 -->
      <div class="card-block">
        <div class="table-title">课程价格表</div>
        <table class="course-table">
          <thead>
            <tr>
              <th>类别</th>
              <th>原价</th>
              <th>优惠</th>
              <th>最终价格</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1期</td>
              <td>1298</td>
              <td>前100名优惠300</td>
              <td>998</td>
              <td>送球服+免费约场地<br />20次课</td>
            </tr>
            <tr>
              <td>2期</td>
              <td>2596</td>
              <td>优惠396</td>
              <td>2200</td>
              <td>送球服+免费约场地<br />20次课</td>
            </tr>
            <tr>
              <td>3期</td>
              <td>3894</td>
              <td>优惠896</td>
              <td>2998</td>
              <td>送球服+免费约场地<br />20次课</td>
            </tr>
            <tr>
              <td>4期</td>
              <td>5192</td>
              <td>优惠1300</td>
              <td>3888</td>
              <td>送球服+免费约场地<br />20次课</td>
            </tr>
            <tr>
              <td>5期</td>
              <td>6498</td>
              <td>优惠1800</td>
              <td>4698</td>
              <td>送球服+免费约场地<br />20次课</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 暑假排课表横向时间轴 -->
      <div class="card-block schedule-block">
        <div class="table-title">暑假排课表</div>
        <div class="schedule-row">
          <span class="schedule-label">第一期：</span>
          <div class="schedule-days">
            <template v-for="d in 21" :key="d">
              <span
                class="schedule-day"
                :class="{ rest: d === 11 }"
                :title="d === 11 ? '休息日' : '上课日'"
              >
                {{ d + 4 }}<span v-if="d === 11" class="rest-text">休</span>
              </span>
            </template>
          </div>
          <span class="schedule-range">7月5日~7月25日</span>
        </div>
        <div class="schedule-row">
          <span class="schedule-label">第二期：</span>
          <div class="schedule-days">
            <template v-for="d in 21" :key="d">
              <span
                class="schedule-day"
                :class="{ rest: d === 11 }"
                :title="d === 11 ? '休息日' : '上课日'"
              >
                {{ d + 4 }}<span v-if="d === 11" class="rest-text">休</span>
              </span>
            </template>
          </div>
          <span class="schedule-range">8月5日~8月25日</span>
        </div>
      </div>

      <!-- 课程说明区 -->
      <div class="card-block">
        <div class="desc-title">课程说明</div>
        <ul>
          <li>每期20次课，每次1.5小时+15分钟篮球专项体适能，赠送球衣</li>
          <li>训练内容：基础体能、篮球技巧、实战演练</li>
          <li>博士生高训班为12天连训，限20人，赠送装备礼包</li>
        </ul>
      </div>

      <!-- 场馆介绍区 -->
      <div class="card-block">
        <div class="venue-title">标准化多功能场馆</div>
        <div class="venue-features">
          <div class="feature-item">
            <span class="icon">🏀</span>
            <span class="feature-title">篮球</span>
            <div class="feature-desc">
              各年龄段系统训练，日常约球自由打，月赛、联赛带来成长与对抗提升
            </div>
          </div>
          <div class="feature-item">
            <span class="icon">🏸</span>
            <span class="feature-title">羽毛球</span>
            <div class="feature-desc">
              4块标准羽毛球场，定场地、约比赛，适合竞技与亲子互动，技能提升！
            </div>
          </div>
          <div class="feature-item">
            <span class="icon">🏐</span>
            <span class="feature-title">气排球</span>
            <div class="feature-desc">
              气排球场x3，支持自由组队预约、定场地、约比赛，技能提升齐训练
            </div>
          </div>
          <div class="feature-item">
            <span class="icon">💪</span>
            <span class="feature-title">体适能</span>
            <div class="feature-desc">
              青少年素质发展，系统训练协调性、柔韧性、核心力量，增强自信与身体掌控力！
            </div>
          </div>
        </div>
        <div class="venue-table-title">--- 全面开放场地预定 ---</div>
        <table class="venue-table">
          <thead>
            <tr>
              <th>类别</th>
              <th>单价（小时）</th>
              <th>月卡</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>羽毛球</td>
              <td>20元/小时</td>
              <td>198元/月</td>
              <td>需先预约-空场地不限时</td>
            </tr>
            <tr>
              <td>篮球</td>
              <td>20元/人</td>
              <td>99元/月</td>
              <td>需先预约-空场地不限时</td>
            </tr>
            <tr>
              <td>气排球</td>
              <td>电话联系</td>
              <td>暂无待定3*元/月</td>
              <td>需先预约-空场地不限时</td>
            </tr>
            <tr>
              <td>会员</td>
              <td>免费</td>
              <td>免费</td>
              <td>俱乐部训练学员</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 报名/咨询区 -->
      <div class="card-block contact-section">
        <div class="contact-title">立即报名/咨询</div>
        <div class="contact-qr">
          <img
            src="@/assets/qr_wechat.png"
            alt="微信咨询二维码"
            class="qr-img"
          />
          <div class="qr-tip">微信扫码咨询/报名</div>
        </div>
        <div class="contact-phone">电话：186-7049-9614</div>
        <div class="contact-phone">电话：186-9253-5677</div>
        <button class="signup-btn">在线报名</button>
      </div>
    </div>

    <!-- 在页面底部渲染悬浮报名条组件 -->
    <FloatingSignupBar />
  </div>
</template>

<script setup>
import FloatingSignupBar from "@/components/FloatingSignupBar.vue";
// 预留后续表单/报名逻辑
</script>

<style>
:root {
  --primary: #1a73e8;
  --secondary: #34d399;
  --bg: #f8fafc;
  --card-bg: #fff;
  --shadow: 0 2px 12px rgba(52, 211, 153, 0.09);
  --radius: 18px;
}
.train-page {
  background: var(--bg);
  min-height: 100vh;
}
.train-banner {
  position: relative;
  text-align: center;
  margin: 0 auto 2.2rem auto;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  max-width: 1400px;
  width: 100%;
}
.banner-img {
  width: 100%;
  max-width: 100%;
  max-height: 340px;
  object-fit: cover;
  border-radius: var(--radius);
  filter: brightness(0.92);
  display: block;
  margin: 0 auto;
}
.banner-title {
  position: absolute;
  left: 2rem;
  top: 2.5rem;
  font-size: 2.2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  letter-spacing: 1px;
}
.banner-sub {
  position: absolute;
  left: 2rem;
  top: 5.2rem;
  font-size: 1.3rem;
  color: #e3f6fc;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  letter-spacing: 0.5px;
}
.train-main {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0 2vw;
}
.card-block {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.3rem 1.5rem 1.5rem 1.5rem;
  margin-bottom: 0.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}
.highlight-title,
.table-title,
.desc-title,
.venue-title,
.venue-table-title,
.contact-title {
  font-size: 1.18rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 0.7em;
  letter-spacing: 0.5px;
}
.card-block ul {
  padding-left: 1.2em;
  color: #333;
  font-size: 1em;
  margin: 0;
}
.course-table,
.venue-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1em;
  margin-top: 0.5em;
  background: #fafdff;
  border-radius: 12px;
  overflow: hidden;
}
.course-table th,
.course-table td,
.venue-table th,
.venue-table td {
  border: 1px solid #e3eefe;
  padding: 0.7em 0.9em;
  text-align: center;
}
.course-table th,
.venue-table th {
  background: linear-gradient(90deg, #e3f6fc 0%, #f3f8fd 100%);
  color: var(--primary);
  font-weight: 600;
}
.course-table td,
.venue-table td {
  background: #fff;
}
.venue-features {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}
.feature-item {
  flex: 1 1 180px;
  min-width: 150px;
  background: #f3f8fd;
  border-radius: 12px;
  padding: 1em 1.1em;
  box-shadow: 0 1px 4px rgba(52, 211, 153, 0.06);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0.5em;
}
.icon {
  font-size: 1.6em;
  margin-bottom: 0.2em;
}
.feature-title {
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.2em;
}
.feature-desc {
  font-size: 0.98em;
  color: #333;
}
.venue-table-title {
  font-size: 1.08em;
  color: var(--primary);
  font-weight: 600;
  margin: 1.1em 0 0.5em 0;
}
.contact-section {
  text-align: center;
}
.contact-qr {
  margin-bottom: 0.7em;
}
.qr-img {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border: 1px solid #e3eefe;
  object-fit: cover;
  margin-bottom: 0.3em;
}
.qr-tip {
  color: #888;
  font-size: 0.97em;
}
.contact-phone {
  color: #222;
  font-size: 1.08em;
  margin-bottom: 0.7em;
}
.signup-btn {
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.12em;
  font-weight: bold;
  padding: 0.8em 2.8em;
  margin-top: 0.7em;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 6px rgba(52, 211, 153, 0.08);
  min-width: 180px;
}
.signup-btn:hover {
  background: linear-gradient(90deg, #1760c4 0%, #2bb98a 100%);
}
.signup-btn:active {
  background: #1a73e8;
}
.signup-btn:disabled {
  background: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}
.schedule-block {
  overflow-x: auto;
}
.schedule-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.7em;
  flex-wrap: wrap;
}
.schedule-label {
  min-width: 70px;
  color: var(--primary);
  font-weight: 600;
  font-size: 1.05em;
}
.schedule-days {
  display: flex;
  gap: 0.3em;
  overflow-x: auto;
  padding: 0.2em 0.5em;
}
.schedule-day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5em;
  height: 2.5em;
  border-radius: 50%;
  background: linear-gradient(100deg, var(--primary) 0%, var(--secondary) 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.25em;
  margin-right: 0.18em;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.1),
    0 1.5px 6px rgba(52, 211, 153, 0.1);
  border: 2.5px solid #e3eefe;
  position: relative;
  transition: box-shadow 0.2s, transform 0.15s;
  cursor: pointer;
  letter-spacing: 0.02em;
}
.schedule-day.rest {
  background: #f2f2f2 !important;
  color: #c82333 !important;
  border: 2.5px solid #e0e0e0;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(200, 35, 51, 0.08);
}
.schedule-day:not(.rest):hover {
  box-shadow: 0 4px 16px rgba(26, 115, 232, 0.18),
    0 2px 8px rgba(52, 211, 153, 0.13);
  transform: scale(1.08);
}
.rest-text {
  font-size: 0.7em;
  color: #c82333;
  margin-left: 0.1em;
  position: absolute;
  right: 0.18em;
  top: 0.18em;
  font-weight: 700;
}
.schedule-range {
  margin-left: 1em;
  color: #888;
  font-size: 0.98em;
}
@media (max-width: 1200px) {
  .train-banner,
  .train-main {
    max-width: 100vw;
  }
  .train-main {
    padding: 0 0.5rem;
  }
}
@media (max-width: 900px) {
  .train-banner {
    margin-bottom: 1.2rem;
    width: 100%;
    border-radius: var(--radius);
  }
  .banner-title {
    font-size: 1.2rem;
    left: 1rem;
    top: 0.7rem;
  }
  .banner-sub {
    font-size: 1rem;
    left: 1rem;
    top: 2.2rem;
  }
  .banner-img {
    max-height: 140px;
    width: 100%;
    border-radius: var(--radius);
  }
  .train-main {
    padding: 0 0.2rem;
    gap: 1rem;
    max-width: 100vw;
  }
  .card-block {
    padding: 0.8rem 0.7rem 1rem 0.7rem;
  }
  .venue-features {
    flex-direction: column;
    gap: 0.7rem;
  }
  .feature-item {
    min-width: 0;
    padding: 0.7em 0.7em;
  }
  .course-table,
  .venue-table {
    font-size: 0.95em;
  }
  .signup-btn {
    font-size: 1em;
    padding: 0.7em 1.2em;
    min-width: 120px;
  }
  .schedule-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3em;
  }
  .schedule-range {
    margin-left: 0;
    margin-top: 0.2em;
  }
}
</style>
