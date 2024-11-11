<template>
  <div class="order-confirmation-container">
    <h2>订单确认</h2>
    <el-table :data="orderList" style="width: 100%">
      <el-table-column prop="dish.image" label="图片" width="180">
          <template slot-scope="scope">
            <el-image style="width: 40px; height: 40px; border: none; cursor: pointer"
                      :src="getImageUrl(scope.row.dish.image)">
              <div slot="error"
                   class="image-slot">
                <img src="./../../assets/noImg.png"
                     style="width: auto; height: 40px; border: none">
              </div>
            </el-image>
          </template>
        </el-table-column>
      <el-table-column prop="dish.name" label="菜品名称" width="180"></el-table-column>
      <el-table-column prop="dish.price" label="单价" width="100">
        <template slot-scope="scope">
          ￥{{ scope.row.dish.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="数量" width="150">
        <template slot-scope="scope">
          <el-input-number 
            v-model="scope.row.quantity" 
            :min="1" 
            @change="updateQuantity(scope.row)" 
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column label="小计" width="120">
        <template slot-scope="scope">
          ￥{{ (scope.row.dish.price * scope.row.quantity).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="removeItem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="order-summary">
      <p>总金额：￥{{ totalAmount.toFixed(2) }}</p>
      <el-button type="success" @click="confirmOrder">确认订单</el-button>
    </div>

    <!-- 添加返回按钮 -->
    <div class="footer-buttons">
      <el-button type="primary" @click="goBack">返回点单页面</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'OrderConfirmation'
})
export default class OrderConfirmation extends Vue {
  // 映射 Vuex getters 获取订单列表
  get orderList() {
    return this.$store.getters['order/getOrderList'] || [];
  }

  // 映射 Vuex actions，用于更新订单列表
  updateOrderItem(orderItem) {
    this.$store.dispatch('order/addOrderItem', orderItem);
  }

  removeOrderItem(orderItem) {
    this.$store.dispatch('order/removeOrderItem', orderItem);
  }

  // 计算总金额
  get totalAmount() {
    return this.orderList.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  }

  // 更新数量
  updateQuantity(orderItem) {
  // 创建对象的浅拷贝以避免直接修改原始对象
  const updatedOrderItem = {
    ...orderItem,
    quantity: orderItem.quantity, // 使用更新后的数量
  };

  // 更新 Vuex store 中的数量
  if (updatedOrderItem.quantity <= 0) {
    this.removeItem(updatedOrderItem);
  } else {
    this.updateOrderItem(updatedOrderItem);
  }
}

  // 删除某一项
  removeItem(orderItem) {
    this.removeOrderItem(orderItem);
  }

  // 确认订单
  confirmOrder() {
    if (this.orderList.length === 0) {
      this.$message.warning('订单中没有任何菜品，请先添加菜品！');
      return;
    }
    this.$message.success('订单已确认！');
    this.$router.push({ path: '/order' });
    // 你可以在这里添加跳转到支付页面或者其他操作
  }

  // 返回到点单页面
  goBack() {
    this.$router.push({ path: '/order' }); // 修改路径为点单页面的路径
  }
  private getImageUrl(image: any) {
  if (image instanceof Blob) {
    return URL.createObjectURL(image);  // 将Blob对象转换为URL
  }
  // 如果是base64编码的字符串，添加正确的前缀
  if (typeof image === 'string' && image.startsWith('iVBOR')) {
    return `data:image/png;base64,${image}`;  // 为base64字符串加上前缀
  }
  return image;  // 如果是URL字符串，直接返回
}
}

</script>

<style scoped>
.order-confirmation-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.order-summary {
  margin-top: 20px;
  text-align: right;
}

.order-summary p {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.footer-buttons {
  margin-top: 20px;
  text-align: left;
}
</style>
