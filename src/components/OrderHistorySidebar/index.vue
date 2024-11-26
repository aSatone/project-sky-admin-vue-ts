<template>
  <div class="order-history-sidebar">
    <div class="sidebar-header">
      <h3>订单历史</h3>
      <el-button icon="el-icon-close" @click="$emit('close')" class="close-button"></el-button>
    </div>
    <div class="order-list" v-if="orders.length > 0">
      <div v-for="(item, index) in orders" :key="index" class="order-item">
        <div class="order-details">
          <p>菜品: {{ item.name }}</p>
          <p>数量: {{ item.quantity }}</p>
          <!-- <p>桌号: {{ item.tableId }}</p> -->
          <!-- <p>订单时间: {{ formatDate(item.orderTime) }}</p> -->
        </div>
      </div>
      <div class="total">
        总订单数: {{ orders.length }}
      </div>
    </div>
    <div v-else class="empty-message">
      <p>订单列表为空。</p>
    </div>
    <div class="actions">
      <el-button type="primary" @click="$emit('confirmPayment')" :disabled="orders.length === 0">支付</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class OrderHistorySidebar extends Vue {
  @Prop({ required: true }) orders!: any[]; // 从父组件接收 `orders` 作为订单列表数据

  // 格式化订单时间
  formatDate(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
</script>

<style scoped lang="scss">
.order-history-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100%;
  background-color: #f9f9f9;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;

    h3 {
      margin: 0;
      font-size: 18px;
    }

    .close-button {
      font-size: 20px;
      color: #888;
    }
  }

  .order-list {
    flex-grow: 1;
    overflow-y: auto;
    margin-top: 20px;

    .order-item {
      border-bottom: 1px solid #ddd;
      padding: 10px 0;

      .order-details {
        margin-bottom: 5px;

        p {
          margin: 0;
          font-size: 14px;
        }
      }
    }

    .total {
      margin-top: 20px;
      font-weight: bold;
      text-align: right;
      font-size: 16px;
    }
  }

  .empty-message {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #aaa;
  }

  .actions {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
