const api = require('../../utils/api.js');
const app = getApp();

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
    availableSlots: [],
    message: "",
    errorMsg: "",
    showAreaType: false, // 是否显示分区选择
    showCourtSelect: false, // 是否显示场地选择
    disabledMap: {}, // { courtId: [{start, end}, ...] }
  },

  async onLoad() {
    this.setDateOptions();
    await this.fetchCourtTypes();
    this.fetchDisabledMap();
  },

  setDateOptions() {
    const today = new Date();
    const dateOptions = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return {
        label: `${month}月${day}日${i === 0 ? ' (今天)' : ''}`,
        value: `${year}-${month}-${day}`
      };
      });
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
    }, () => {
      this.fetchCourtsByTypeAndArea();
      this.fetchDisabledMap();
    });
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
      console.log('fetchCourtsByTypeAndArea type_id:', this.data.courtTypeId, 'areaType:', this.data.areaType);
      console.log('可选场地列表:', courts);
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
    }, () => {
      this.fetchCourtsByTypeAndArea();
      this.fetchDisabledMap();
    });
  },

  // 选择场地
  onSelectCourt(e) {
    const id = e.currentTarget.dataset.id;
    console.log('选中场地 courtId:', id);
    this.setData({
      courtId: id,
      startTime: "",
      duration: 1,
    }, () => {
      console.log('onSelectCourt callback: courtId:', this.data.courtId, 'date:', this.data.date);
      if (this.data.courtId && this.data.date) {
        this.fetchDisabledMap();
      } else {
        this.setData({ availableSlots: [] });
      }
    });
  },

  // 选择日期
  onDateChange(e) {
    const value = e.detail.value;
    const dateOption = this.data.dateOptions.find(d => d.value === value);
    this.setData({
      date: value,
      dateLabel: dateOption ? dateOption.label : value,
    }, () => {
      console.log('onDateChange callback: courtId:', this.data.courtId, 'date:', this.data.date);
      // 只有选中场地和日期后才请求禁用映射
      if (this.data.courtId && this.data.date) {
        this.fetchDisabledMap();
      } else {
        this.setData({ availableSlots: [] });
      }
    });
  },

  // 预约提交前校验当前时间格是否被禁用
  async onSubmit() {
    const params = {
      court_id: this.data.courtId,
      date: this.data.date,
      start_time: this.data.startTime,
      duration: this.data.duration * 60,
      price: 0,
      phone: this.data.phone,
      status: 'reserved',
    };
    const { courtId, startTime, duration, phone, date, disabledMap } = this.data;
    if (!courtId || !startTime || !duration || !phone) {
      this.setData({ message: "请完整填写信息" });
      return;
    }
    if (!this.isValidPhone(phone)) {
      this.setData({ message: "请输入正确的手机号码" });
      return;
    }
    // 禁用校验
    const slotStart = parseInt(startTime.slice(0, 2)) * 60 + parseInt(startTime.slice(3, 5));
    const slotEnd = slotStart + duration * 60;
    const disables = (disabledMap[courtId] || []);
    const isDisabled = disables.some(({ start, end }) => Math.max(slotStart, start) < Math.min(slotEnd, end));
    if (isDisabled) {
      this.setData({ message: "该时间段已被预约，请选择其他时间" });
      return;
    }
    this.setData({ loading: true, message: "", errorMsg: "" });
    try {
      await api.createReservation(params);
      this.setData({
        message: "预约成功！",
        errorMsg: "",
        loading: false,
        phone: "",
      });
      await this.fetchDisabledMap();
    } catch (e) {
      this.setData({
        message: e.message || (e.response && e.response.data && e.response.data.msg) || "预约失败",
        errorMsg: e.message || (e.response && e.response.data && e.response.data.msg) || "预约失败",
        loading: false,
      });
    }
  },

  // 请求后端禁用映射
  async fetchDisabledMap() {
    const { date, courtId } = this.data;
    console.log('fetchDisabledMap: date:', date, 'courtId:', courtId);
    this.setData({ loading: true });
    try {
      const res = await api.getDisabledSlots(date, courtId);
      console.log('API 返回数据:', res.data);
      let rawData = res.data;
      if (typeof rawData === 'string') {
        try {
          rawData = JSON.parse(rawData);
        } catch (e) {
          console.error('解析错误:', e);
          rawData = {};
        }
      }
      const safeDisabledMap = JSON.parse(JSON.stringify(rawData));
      console.log('safeDisabledMap before setData:', safeDisabledMap);
      this.setData({ disabledMap: safeDisabledMap }, () => {
        console.log('setData回调内的disabledMap:', this.data.disabledMap);
        this.updateAvailableSlots(safeDisabledMap);
      });
    } catch (e) {
      console.error('fetchDisabledMap 错误:', e);
      this.setData({ disabledMap: {} }, () => {
        this.updateAvailableSlots({});
      });
      this.setData({ errorMsg: '禁用信息获取失败' });
    } finally {
      this.setData({ loading: false });
    }
  },

  updateAvailableSlots(externalDisabledMap) {
    const courtId = (this.data.courtId || '').trim();
    const disabledMap = externalDisabledMap || this.data.disabledMap;
    // 对所有key做trim，构造新对象
    const trimmedMap = {};
    Object.keys(disabledMap).forEach(k => {
      trimmedMap[k.trim()] = disabledMap[k];
    });
    console.log('updateAvailableSlots externalDisabledMap keys:', Object.keys(trimmedMap), 'courtId:', courtId);
    console.log('updateAvailableSlots disabledMap:', disabledMap);
    if (!courtId) {
      this.setData({ availableSlots: [] });
      return;
    }
    const duration = this.data.duration;
    const disables = (trimmedMap && trimmedMap[courtId]) ? trimmedMap[courtId] : [];
    const slots = [];
    for (let h = 8; h < 22; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : m}:00`;
        const slotStart = h * 60 + m;
        const slotEnd = slotStart + duration * 60;
        const disabled = disables.some(({ start, end }) => Math.max(slotStart, start) < Math.min(slotEnd, end));
        console.log(`时间格: ${time}, disabled: ${disabled}`);
        slots.push({
          label: `${h}:${m === 0 ? '00' : m}`,
          value: time,
          disabled
        });
      }
    }
    this.setData({ availableSlots: slots });
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
});