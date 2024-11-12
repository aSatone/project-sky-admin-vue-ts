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

@Component({
  name: 'OrderConfirmation'
})
export default class OrderConfirmation extends Vue {
  // Vuexのgetterを使って注文リストを取得
  get orderList() {
    return this.$store.getters['order/getOrderList'] || [];
  }

  // Vuexのactionを使用して注文リストを更新
  updateOrderItem(orderItem) {
    this.$store.dispatch('order/addOrderItem', orderItem);  // 注文項目の更新
  }

  removeOrderItem(orderItem) {
    this.$store.dispatch('order/removeOrderItem', orderItem);  // 注文項目の削除
  }

  // 合計金額を計算
  get totalAmount() {
    return this.orderList.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  }

  // 数量の更新
  updateQuantity(orderItem) {
    // オブジェクトの浅いコピーを作成して元のオブジェクトを直接変更しないようにする
    const updatedOrderItem = {
      ...orderItem,
      quantity: orderItem.quantity, // 更新された数量を使用
    };

    // Vuexストア内の数量を更新
    if (updatedOrderItem.quantity <= 0) {
      this.removeItem(updatedOrderItem);  // 数量が0以下ならその項目を削除
    } else {
      this.updateOrderItem(updatedOrderItem);  // 数量を更新
    }
  }

  // 注文項目の削除
  removeItem(orderItem) {
    this.removeOrderItem(orderItem);  // 指定した注文項目を削除
  }

  // 注文を確定
  confirmOrder() {
    if (this.orderList.length === 0) {
      this.$message.warning('注文に料理が追加されていません。先に料理を追加してください！');  // 注文リストが空の場合、警告メッセージを表示
      return;
    }
    this.$message.success('注文が確定しました！');  // 注文が確定したことを知らせるメッセージ
    this.$router.push({ path: '/order' });  // 注文ページ（例：支払いページ）へ遷移
  }

  // 注文ページに戻る
  goBack() {
    this.$router.push({ path: '/order' }); // 注文ページへの遷移
  }

  // 画像URLを取得
  private getImageUrl(image: any) {
    if (image instanceof Blob) {
      return URL.createObjectURL(image);  // BlobオブジェクトをURLに変換
    }
    // base64エンコードされた文字列の場合、適切なプレフィックスを付ける
    if (typeof image === 'string' && image.startsWith('iVBOR')) {
      return `data:image/png;base64,${image}`;  // base64文字列にプレフィックスを追加
    }
    return image;  // URL文字列の場合はそのまま返す
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
