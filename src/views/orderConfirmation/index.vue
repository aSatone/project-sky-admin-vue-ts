<template>
  <div class="order-confirmation-container">
    <h2>注文确认</h2>
    <el-table :data="cartItems" style="width: 100%">
      <el-table-column prop="dish.name" label="菜品名称" width="180" />
      <el-table-column label="菜品图片">
        <template slot-scope="scope">
          <el-image :src="getImageUrl(scope.row.dish.image)" style="width: 100px; height: 100px;"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="数量">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.quantity" :min="1" @change="updateQuantity(scope.row)"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column prop="dish.price" label="单价" width="100" />
      <el-table-column label="总价">
        <template slot-scope="scope">
          ￥{{ (scope.row.dish.price * scope.row.quantity).toFixed(2) }}
        </template>
      </el-table-column>
    </el-table>
    <div class="confirm-section">
      <el-button type="primary" @click="confirmFinalOrder">确认下单</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { OrderModule } from '@/store/modules/order'
import axios from 'axios'

@Component({
  name: 'OrderConfirmation',
})
export default class OrderConfirmation extends Vue {
  get cartItems() {
    return OrderModule.cart;
  }

  private updateQuantity(item: any) {
    OrderModule.UPDATE_QUANTITY({
      dishId: item.dish.id,
      tableNumber: item.tableNumber,
      quantity: item.quantity
    });
  }

  private async confirmFinalOrder() {
    try {
      const orderData = {
        tableNumber: this.cartItems[0]?.tableNumber,
        dishes: this.cartItems.map(item => ({
          dishId: item.dish.id,
          quantity: item.quantity
        }))
      };

      const response = await axios.post('/api/order/create', orderData);
      if (response.data.success) {
        this.$message.success('订单已提交！');
        OrderModule.CLEAR_CART(); // 提交成功后清空购物车
        this.$router.push('/order-success'); // 跳转到订单成功页面
      } else {
        this.$message.error('提交订单失败，请重试。');
      }
    } catch (error) {
      this.$message.error('订单提交失败，请稍后再试。');
    }
  }

  private getImageUrl(image: any) {
    if (image instanceof Blob) {
      return URL.createObjectURL(image);
    }
    if (typeof image === 'string' && image.startsWith('iVBOR')) {
      return `data:image/png;base64,${image}`;
    }
    return image;
  }
}
</script>

<style scoped>
.order-confirmation-container {
  padding: 30px;

  .confirm-section {
    margin-top: 20px;
    text-align: right;

    .el-button {
      width: 20%;
      height: 40px;
    }
  }
}
</style>
