<template>
  <div class="user-welcome">
    <!-- ウェルカムタイトル -->
    <h1 class="table-number">レストランへようこそ！</h1>

    <!-- ランダムなテーブル番号 -->
    <div class="table-number">
      <h2>あなたのテーブル番号は：11</h2>
      <!-- <el-button type="primary" @click="generateTableNumber">テーブル番号を再生成</el-button> -->
    </div>

    <!-- 人数選択 -->
    <div class="guest-selection">
      <h2>お食事人数を選択してください：</h2>
      <el-select v-model="guestCount" placeholder="人数を選択してください">
        <el-option v-for="n in 10" :key="n" :label="n + ' 人'" :value="n"></el-option>
      </el-select>
    </div>

    <!-- 確認ボタン -->
    <div class="confirm-button">
      <el-button type="success" @click="confirmDetails">確認して注文を続ける</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Message } from 'element-ui';
import { Store } from 'vuex';

@Component
export default class UserWelcome extends Vue {
  // テーブル番号
  private tableNumber: number = this.generateRandomTableNumber()

  // 食事人数
  private guestCount: number | null = null

  // ランダムなテーブル番号を生成
  private generateRandomTableNumber(): number {
    return Math.floor(Math.random() * 50) + 1 // テーブル番号は 1 から 50 の間で生成
  }
  get orderList() {
    return this.$store.getters['order/getOrderList'] || [];
  }
  get tableId() {
    return this.$store.getters['order/getTableId'];
  }
  get orderId() {
    return this.$store.getters['order/getOrderId'];
  }

  // ボタンをクリックして新しいテーブル番号を生成
  private generateTableNumber() {
    this.tableNumber = this.generateRandomTableNumber()
  }

  // 人数とテーブル番号を確認
  private confirmDetails() {
    if (this.guestCount === null) {
      Message.error('お食事人数を選択してください！') // 人数が選択されていない場合はエラーメッセージを表示
    } else {
      Message.success(`テーブル番号 ${this.tableNumber}、人数 ${this.guestCount}、お食事をお楽しみください！`) // 確認メッセージを表示
      // ここで注文ページに進むことができます

      const orderId = `${Date.now()}`;
      this.$store.dispatch('order/setOrderId', orderId);
      this.$store.dispatch('order/setTableId', 11)
      console.log(this.tableId)
      console.log(this.orderId)
      console.log(this.orderList)
      this.$router.push({ path: '/order' }); // 注文ページに遷移
    }
  }
}
</script>

<style scoped lang="scss">
.user-welcome {
  text-align: center; /* コンテンツを中央揃え */
  margin-top: 50px;

  .title {
    font-size: 32px;
    color: #333;
  }

  .table-number {
    margin: 30px 0;
    font-size: 24px;
    color: #555;

    h2 {
      margin-bottom: 10px;
    }
  }

  .guest-selection {
    margin: 20px 0;
    font-size: 20px;
  }

  .confirm-button {
    margin-top: 40px;

    .el-button {
      padding: 10px 20px;
    }
  }
}
</style>
