<template>
  <div class="layout">
    <group>
      <p class="padding">{{ name }}</p>
    </group>
    <group>
      <p class="padding">剩余可用时间：{{ rest_time }}小时</p>
    </group>
    <group>
      <p class="padding">空间：{{ location }}</p>
    </group>
    <group>
      <p class="padding">使用时段：{{ date }}</p>
    </group>
    <flexbox class="buttons">
      <x-button type="primary" @click="pay">确认扣除</x-button>
    </flexbox>
  </div>
</template>

<script>
import { XButton, Group, Flexbox, FlexboxItem } from 'vux/src/components';
import { Order } from '../data/order';
import { Location } from '../data/select';
import { store } from '../data/user';
import wx from 'weixin-js-sdk';

export default {
  components: {
    XButton,
    Flexbox,
    FlexboxItem,
    Group,
  },
  data() {
    /* eslint-disable */
    const local = store.get('COMPANY');
    const { name, id, rest_time } = local;
    const { start, end } = Order;
    const duration = (end - start) / 3600000;
    Order.setId(id);
    Order.setDuration(duration);
    return {
      rest_time,
      location: '',
      count: 0,
      name,
      date: `${this.getDate(Order.start)} - ${this.getDate(Order.end)}`,
    };
  },
  created() {
    wx.config(store.get('JSCONFIG'));
    const locationName = Order.location && Location[parseInt(Order.location, 10) - 1].value;
    this.$set('location', locationName);
  },
  methods: {
    /* eslint-disable */
    pay() {
      this.$http.post('/api/pay_by_member', { Order }).then(resp => {
        const resault = resp.json();
        if (resault.invaild) this.$router.go({ name: 'finish' });
        else {
          this.$http.post('/api/pay_by_nomal', {
            total: parseInt(Order.price),
            openid: store.get('OPEN_ID'),
          }).then(resp => {
            const resault = resp.json();
            wx.chooseWXPay(
              Object.assign({}, resault, {success: resp => {
                this.$router.go({ name: 'finish' });
              }})
            );
          });
        }
      })
    },
    getDate(date) {
      const ndate = new Date(date);
      const month = ndate.getMonth() ? ndate.getMonth() : 12;
      const minute = parseInt(ndate.getMinutes(), 10) === 0 ? '00' : ndate.getMinutes();
      return `${month}月${ndate.getDate()}日${ndate.getHours()}:${minute}`;
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
  .padding {
    padding: 10px 15px;
  }
</style>
