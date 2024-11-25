<template>
  <div class="order-confirmation-container">
    <h2>注文確認</h2>

    <!-- 注文のテーブル -->
    <el-table :data="orderList" style="width: 100%">
      <!-- 画像列 -->
      <el-table-column prop="dish.image" label="画像" width="180">
        <template slot-scope="scope">
          <!-- 料理の画像を表示、クリックしても何も起こらない -->
          <el-image style="width: 40px; height: 40px; border: none; cursor: pointer"
            :src="getImageUrl(scope.row.dish.image)">
            <div slot="error" class="image-slot">
              <img src="./../../assets/noImg.png" style="width: auto; height: 40px; border: none">
            </div>
          </el-image>
        </template>
      </el-table-column>

      <!-- 料理名列 -->
      <el-table-column prop="dish.name" label="料理名" width="180"></el-table-column>

      <!-- 単価列 -->
      <el-table-column prop="dish.price" label="単価" width="100">
        <template slot-scope="scope">
          ￥{{ scope.row.dish.price.toFixed(2) }}
        </template>
      </el-table-column>

      <!-- 数量列 -->
      <el-table-column label="数量" width="150">
        <template slot-scope="scope">
          <!-- 数量を変更する入力ボックス -->
          <el-input-number 
            v-model="scope.row.quantity" 
            :min="1" 
            @change="updateQuantity(scope.row)" 
            size="small"
          />
        </template>
      </el-table-column>

      <!-- 小計列 -->
      <el-table-column label="小計" width="120">
        <template slot-scope="scope">
          ￥{{ (scope.row.dish.price * scope.row.quantity).toFixed(2) }}
        </template>
      </el-table-column>

      <!-- 操作列（削除ボタン）-->
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <!-- 削除ボタン -->
          <el-button type="danger" size="mini" @click="removeItem(scope.row)">削除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 注文金額の概要 -->
    <div class="order-summary">
      <p>合計金額：￥{{ totalAmount.toFixed(2) }}</p>
      <!-- 注文確定ボタン -->
      <el-button type="success" @click="confirmOrder">注文確定</el-button>
    </div>

    <!-- 戻るボタン -->
    <div class="footer-buttons">
      <el-button type="primary" @click="goBack">注文ページに戻る</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { putOrderList } from '@/api/order';
import { addEmployee, queryEmployeeById, updateEmployee } from '@/api/employee'
import axios from 'axios';

@Component({
  name: 'OrderConfirmation'
})
export default class OrderConfirmation extends Vue {
  private ruleForm = {
    name: '',
    username: '',
    sex: '1',
    phone: '',
    idNumber: ''
  };
  //private tableId: number = 1;
  //private orderId: number = 1;

  // Vuex的getter来获取订单列表
  get orderList() {
    return this.$store.getters['order/getOrderList'] || [];
  }
  get tableId() {
    return this.$store.getters['order/getTableId'];
  }
  get orderId() {
    return this.$store.getters['order/getOrderId'];
  }

  // Vuex的action来更新和删除订单项
  updateOrderItem(orderItem) {
    this.$store.dispatch('order/addOrderItem', orderItem);  // 更新订单项
  }

  removeOrderItem(orderItem) {
    this.$store.dispatch('order/removeOrderItem', orderItem);  // 删除订单项
  }

  // 计算总金额
  get totalAmount() {
    return this.orderList.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  }

  // 更新数量
  updateQuantity(orderItem) {
    const updatedOrderItem = {
      ...orderItem,
      quantity: orderItem.quantity,
    };

    if (updatedOrderItem.quantity <= 0) {
      this.removeItem(updatedOrderItem);  // 如果数量为0，则移除订单项
    } else {
      this.updateOrderItem(updatedOrderItem);  // 否则更新数量
    }
  }

  // 删除订单项
  removeItem(orderItem) {
    this.removeOrderItem(orderItem);
  }

  // 确认订单
  confirmOrder() {
    if (this.orderList.length === 0) {
      this.$message.warning('注文に料理が追加されていません。先に料理を追加してください！');
      return;
    }

    const payload = {
      orderList: this.orderList.map(item => ({
        dishId: item.dish.id,
        quantity: item.quantity,
        price:item.dish.price,
        name: item.dish.name
        
      })),
      tableId: this.tableId,
      orderId: this.orderId
    };

    console.log(payload);

    // axios.put('/api/order/orderList', payload, {
    //   headers: {
    //     'token': 'eyJhbGciOiJIUzI1NiJ9.eyJlbXBJZCI6MSwiZXhwIjoxNzMyMDkzODE1fQ.rMWLx7n_Cz5rr5mM1U-DAtrxP9EwWt97vYCqBgkXdZ0' // 在请求头中添加 token
    //   }
    // })
    //   .then(response => {
    //     // 请求成功的回调
    //     console.log('响应数据:', response.data);
    //   })
    //   .catch(error => {
    //     if (error.response) {
    //       // 请求已发出，服务器响应了状态码，但不在2xx范围内
    //       console.error('响应错误:', error.response.data);
    //       console.error('状态码:', error.response.status);
    //     } else if (error.request) {
    //       // 请求已发出，但没有收到响应
    //       console.error('没有收到响应:', error.request);
    //     } else {
    //       // 其他错误
    //       console.error('请求错误:', error.message);
    //     }
    //   });


    //发送订单数据到后端
    putOrderList(payload).then(res => {
      if (res.data.code === 1) {
        this.$message.success('注文が確定しました！');
        // 提交成功后清空orderList
        this.$store.dispatch('order/clearOrderList'); 
        this.$store.dispatch('order/updatePayState',0); 
        this.$router.push({ path: '/wellcome' });  // 成功后跳转页面，例如支付页面
      } else {
        this.$message.error(res.data.msg);
      }
    }).catch(error => {
      this.$message.error('注文の確定に失敗しました。もう一度試してください。');
      console.error('Error confirming order:', error);
    });

  }

  // 返回订单页
  goBack() {
    this.$router.push({ path: '/order' });
  }

  // 获取图片URL
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
