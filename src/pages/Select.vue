<template>
  <div class="layout">
    <group>
      <selector title="类型" placeholder="请选择" :options="type" @on-change="onTypeChange"></selector>
    </group>
    <group class="tip">
      <datetime :value.sync="date1" month-row="{value}月" day-row="{value}日" hour-row="{value}点" minute-row="{value}分" format="YYYY-MM-DD HH:mm" @on-change="onDate1Change" title="开始时间" :min-year=2016></datetime>
    </group>
    <group>
      <datetime :value.sync="date2" month-row="{value}月" day-row="{value}日" hour-row="{value}点" minute-row="{value}分" format="YYYY-MM-DD HH:mm" @on-change="onDate2Change" title="结束时间"></datetime>
    </group>
    <group>
      <selector :value.sync="selectedLocation" title="地点" :options="location" placeholder="请选择" @on-change="onLocationChange"></selector>
    </group>
    <group>
      <p class="price">价格：{{ price }}元</p>
    </group>
    <flexbox class="buttons">
      <flexbox-item>
        <x-button type="primary" @click="comfirm">即刻预订</x-button>
      </flexbox-item>
      <flexbox-item>
        <x-button type="warn" @click="login">会员通道</x-button>
      </flexbox-item>
    </flexbox>
    <toast :show.sync="show" type="cancel" :time="1000">订单填写有误</toast>
  </div>
</template>

<script>
import { Selector, XButton, Flexbox, FlexboxItem, Group, Datetime,
  Toast } from 'vux/src/components';
import { Type, Location } from '../data/select';
import { Order } from '../data/order';
import { store } from '../data/user';

export default {
  components: {
    Selector,
    XButton,
    Flexbox,
    FlexboxItem,
    Group,
    Datetime,
    Toast,
  },
  data() {
    return {
      type: Type,
      location: Location,
      selectedType: 0,
      selectedLocation: null,
      price: 0,
      date1: '',
      date2: '',
    };
  },
  created() {
    this.initLocation(Order.location);
    this.$http.get('/jsconfig').then(resp => {
      store.set('JSCONFIG', resp.json());
    });
  },
  methods: {
    login() {
      this.isVaild = this.selectedType !== 0 && this.date1 && this.date2 &&
        this.selectedLocation !== 0;
      if (this.isVaild) {
        this.$http.post('/api/check', { Order }).then(resp => {
          if (!resp.json().success) alert('该会议室已经被占用，请重新选择');
          else this.$router.go({ name: 'login' });
        });
      } else {
        this.$set('show', true);
      }
    },
    comfirm() {
      this.isVaild = this.selectedType !== 0 && this.date1 && this.date2 &&
        this.selectedLocation !== 0 && this.price;
      if (this.isVaild) {
        this.$http.post('/api/check', { Order }).then(resp => {
          if (!resp.json().success) alert('该会议室已经被占用，请重新选择');
          else this.$router.go({ name: 'order' });
        });
      } else {
        this.$set('show', true);
      }
    },
    onTypeChange(val) {
      this.selectedType = val;
      Order.setType(val);
      this.countPrice();
    },
    initLocation(id) {
      if (id) {
        this.$set('selectedLocation', id);
      }
    },
    onLocationChange(val) {
      this.$set('selectedLocation', val);
      Order.setLocation(val);
    },
    onDate1Change(val) {
      this.time1 = this.newDate(val);
      Order.setDateStart(this.time1);
      this.countPrice();
    },
    onDate2Change(val) {
      this.time2 = this.newDate(val);
      Order.setDateEnd(this.time2);
      this.countPrice();
    },
    countPrice() {
      if (!Order.type || !Order.start || !Order.end || (this.time2 - this.time1 <= 0)) {
        this.$set('price', 0);
        return;
      }
      let price = (this.time2 - this.time1) / 1800000;
      switch (Order.type) {
        case '1': price = price * 50; break;
        case '2': price = price * 100; break;
        case '3': price = price * 15; break;
        default: price = price * 100; break;
      }
      Order.setPrice(price);
      this.$set('price', price);
    },
    newDate(time) {
      /* eslint-disable */
      const i = time.substr(0, 4);
      const o = parseInt(time.substr(5, 2)) + '';
      const u = time.substr(8, 2);
      const h = time.substr(11, 2);
      const m = time.substr(14, 2);
      return new Date(i, o, u, h, m).getTime();
    },
  },
};
</script>

<style scoped>
  .layout {
    height: 100%;
    width: 100%;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
  }
  .buttons {
    width: 90%;
    position: absolute;
    bottom: 20px;
    left: 5%;
  }
  .tip {
    position: relative;
    margin-bottom: 20px;
  }
  .tip::after {
    content: "";
    /*(超出30分钟按1小时)*/
    position: absolute;
    right: 5%;
    font-size: 10px;
    color: #888;
  }
  .price {
    padding: 10px 15px;
  }
</style>
