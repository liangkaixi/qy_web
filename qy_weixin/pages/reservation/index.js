const api = require('../../utils/api.js');

const areaTypes = [
  { label: "全场", value: "full" },
  { label: "半场", value: "part" },
];
const durations = [1, 2, 3];

Page({
  data: {
    courtTypes: [],
    filteredCourts: [],
    areaTypes,
    durations,
    courtTypeId: "",
    areaType: "",
    courtId: "",
    date: "",
    dateOptions: [],
    dateLabel: "",
    startTime: "",
    duration: 1,
    phone: "",
    loading: false,
    reservations: [],
    availableSlots: [],
    message: "",
    errorMsg: "",
    showAreaType: false, // 是否显示分区选择
    showCourtSelect: false, // 是否显示场地选择
  },

  async onLoad() {
    this.setDateOptions();
    await this.fetchCourtTypes();
  },

  setDateOptions() {
    const today = new Date();
    const dateOptions = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      // 用本地时间拼接日期字符串，避免toISOString的时区问题
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      dateOptions.push({
        label: `${d.getMonth() + 1}月${d.getDate()}日${i === 0 ? " (今天)" : ""}`,
        value: `${year}-${month}-${day}`,
      });
    }
    this.setData({
      dateOptions,
      date: dateOptions[0].value,
      dateLabel: dateOptions[0].label,
    });
  },

  // 获取运动类型
  async fetchCourtTypes() {
    try {
      const res = await api.getCourtTypes();
      if (res.code === 0) {
        this.setData({ courtTypes: res.data, errorMsg: "" });
      } else {
        this.setData({ errorMsg: "场地类型加载失败", courtTypes: [] });
      }
    } catch (e) {
      this.setData({ errorMsg: "场地类型加载失败", courtTypes: [] });
    }
  },

  // 选择类型时，刷新分区和场地
  onSelectType(e) {
    const courtTypeId = e.currentTarget.dataset.id;
    // 判断是否为篮球类型，决定是否显示分区
    const basketballType = this.data.courtTypes.find(t => t.name && t.name.includes("篮球"));
    const showAreaType = courtTypeId === (basketballType ? basketballType.id : "");
    this.setData({
      courtTypeId,
      areaType: "",
      courtId: "",
      filteredCourts: [],
      startTime: "",
      duration: 1,
      showAreaType,
      showCourtSelect: !showAreaType, // 非篮球类型直接显示场地选择
    }, this.fetchCourtsByTypeAndArea);
  },

  // 获取场地（只按类型、分区过滤）
  async fetchCourtsByTypeAndArea() {
    this.setData({ courtId: "", filteredCourts: [], startTime: "", duration: 1 });
    const { courtTypeId, areaType, courtTypes } = this.data;
    if (!courtTypeId) return;
    try {
      const courtsRes = await api.getCourtsByType(courtTypeId);
      if (courtsRes.code !== 0) throw new Error('获取场地失败');
      let courts = courtsRes.data || [];
      // 仅篮球类型显示分区
      const basketballType = courtTypes.find(t => t.name && t.name.includes("篮球"));
      const isBasketball = basketballType && courtTypeId === basketballType.id;
      if (isBasketball) {
        if (areaType) {
          courts = courts.filter(c => c.area_type === areaType);
        } else {
          courts = [];
        }
      }
      // 非篮球类型直接显示场地选择
      this.setData({
        filteredCourts: courts,
        showCourtSelect: !isBasketball || !!areaType,
      });
    } catch (e) {
      this.setData({ errorMsg: e.message || "获取场地失败", filteredCourts: [] });
    }
  },

  // 选择分区
  onSelectArea(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      areaType: value,
      courtId: "",
      filteredCourts: [],
      startTime: "",
      duration: 1,
    }, this.fetchCourtsByTypeAndArea);
  },

  // 选择场地
  onSelectCourt(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      courtId: id,
      startTime: "",
      duration: 1,
    }, this.fetchReservations);
  },

  // 选择日期
  onDateChange(e) {
    const value = e.detail.value;
    const dateOption = this.data.dateOptions.find(d => d.value === value);
    this.setData({
      date: value,
      dateLabel: dateOption ? dateOption.label : value,
    }, () => {
      if (this.data.courtId) this.fetchReservations();
    });
  },

  // 获取预约（用于禁用时间段）
  async fetchReservations() {
    const { courtId, date, courtTypes, courtTypeId } = this.data;
    if (!courtId || !date) return;
    try {
      // 1. 查当前场地的 resource_key
      const courtDetail = await api.getCourtDetail(courtId);
      if (courtDetail.code !== 0 || !courtDetail.data) {
        this.setData({ reservations: [], errorMsg: "场地信息获取失败" });
        this.updateAvailableSlots();
        return;
      }
      const resourceKey = courtDetail.data.resource_key;
      // 2. 查所有同 resource_key 的场地 id（只按类型过滤，不用 venue_id）
      const courtsRes = await api.getCourtsByType(courtTypeId);
      if (courtsRes.code !== 0) throw new Error('分区场地信息获取失败');
      const allCourts = courtsRes.data.filter(c => c.resource_key === resourceKey);
      const courtIds = allCourts.map(c => c.id);
      // 3. 查所有这些场地在当天的预约
      const res = await api.getCourtReservations(courtIds.join(','), date);
      if (res.code !== 0) throw new Error('预约信息获取失败');
      this.setData({ reservations: res.data, errorMsg: "" });
    } catch (e) {
      this.setData({ reservations: [], errorMsg: e.message || "预约信息获取失败" });
    }
    this.updateAvailableSlots();
  },

  // 计算可用时间段
  updateAvailableSlots() {
    const { reservations, duration } = this.data;
    const slots = [];
    for (let h = 8; h < 22; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${h.toString().padStart(2, "0")}:${m === 0 ? "00" : m}:00`;
        // 判断是否有冲突
        const disabled = reservations.some(r =>
          this.isTimeConflict(time, duration * 60, r.start_time, r.duration)
        );
        slots.push({
          label: `${h}:${m === 0 ? "00" : m}`,
          value: time,
          disabled,
        });
      }
    }
    this.setData({ availableSlots: slots });
  },

  // 时间冲突检测
  isTimeConflict(startA, durationA, startB, durationB) {
    // startA, startB: "HH:mm:ss", duration: 分钟
    const toMinutes = t => {
      const [h, m] = t.split(':');
      return parseInt(h) * 60 + parseInt(m);
    };
    const aStart = toMinutes(startA);
    const aEnd = aStart + durationA;
    const bStart = toMinutes(startB);
    const bEnd = bStart + durationB;
    return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
  },

  // 选择时间段
  onSelectSlot(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ startTime: value, duration: 1 });
  },

  // 选择时长
  onSelectDuration(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ duration: value }, this.updateAvailableSlots);
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  // 手机号校验
  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },

  // 提交预约
  async onSubmit() {
    const { courtId, startTime, duration, phone, date } = this.data;
    if (!courtId || !startTime || !duration || !phone) {
      this.setData({ message: "请完整填写信息" });
      return;
    }
    if (!this.isValidPhone(phone)) {
      this.setData({ message: "请输入正确的手机号码" });
      return;
    }
    this.setData({ loading: true, message: "", errorMsg: "" });
    try {
      await api.createReservation({
        court_id: courtId,
        date,
        start_time: startTime,
        duration: duration * 60,
        price: 0,
        phone
      });
      this.setData({
        message: "预约成功！",
        errorMsg: "",
        loading: false,
        phone: "", // 预约成功后清空手机号
      });
      this.fetchReservations();
    } catch (e) {
      // 增强错误信息打印和展示
      console.error('预约失败', e, e.response && e.response.data);
      this.setData({
        message: e.message || (e.response && e.response.data && e.response.data.msg) || "预约失败",
        errorMsg: e.message || (e.response && e.response.data && e.response.data.msg) || "预约失败",
        loading: false,
      });
    }
  },
});