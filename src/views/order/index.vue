<template>
  <div class="dashboard-container">
    <div class="container">

      <!-- カテゴリ選択ボタン -->
      <div class="category-buttons">
        <!-- 日本料理ボタン -->
        <el-button :type="categoryId === 19 ? 'primary' : 'default'" @click="selectCategory(19)" class="category-button">
          日本料理
        </el-button>
        <!-- 中華料理ボタン -->
        <el-button :type="categoryId === 20 ? 'primary' : 'default'" @click="selectCategory(20)" class="category-button">
          中華料理
        </el-button>
        <el-button :type="categoryId === 21 ? 'primary' : 'default'" @click="selectCategory(21)" class="category-button">
          揚げ物
        </el-button> 
        <!-- 西洋料理ボタン -->
        <el-button :type="categoryId === 11 ? 'primary' : 'default'" @click="selectCategory(11)" class="category-button">
          ドリンク
        </el-button>
        <!-- 西洋料理ボタン -->
        <el-button :type="categoryId === 12 ? 'primary' : 'default'" @click="selectCategory(12)" class="category-button">
          主食
        </el-button>
      </div>

      <!-- カードレイアウトで料理を表示 -->
      <el-row :gutter="20" v-if="tableData.length">
        <el-col :span="6" v-for="(item, index) in tableData" :key="index">
          <el-card :body-style="{ padding: '10px' }" class="dish-card">
            <!-- 料理画像を表示、クリックするとダイアログを開く -->
            <el-image :src="getImageUrl(item.image)" style="width: 100%; height: 180px; cursor: pointer"
              @click="openDialog(item)">
              <div slot="error" class="image-slot">
                <img src="./../../assets/noImg.png" style="width: auto; height: 180px; border: none">
              </div>
            </el-image>
            <!-- 料理名と価格を表示 -->
            <div class="dish-info">
              <h4>{{ item.name }}</h4>
              <p class="dish-price">￥{{ item.price.toFixed(2) }}</p>
            </div>
            <!-- 料理を注文リストに追加するボタン -->
            <el-button type="primary" size="mini" @click="openDialog(item)">注文リストに追加</el-button>
          </el-card>
        </el-col>
      </el-row>
      <Empty v-else :is-search="isSearch" />
      <el-pagination v-if="counts > 10" class="pageList" :page-sizes="[8, 16, 24, 32]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="counts" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
      <!-- 注文確認ボタン -->
      <div class="confirm-order-button">
        <el-button type="success" @click="confirmOrder">注文確認</el-button>
      </div>

      <!-- ダイアログのスタイル -->
      <el-dialog :visible.sync="dialogVisible" width="30%" :title="selectedDish && selectedDish.name" :modal="false">
        <div v-if="selectedDish" class="dialog-content">
          <!-- 料理の画像を表示 -->
          <el-image :src="getImageUrl(selectedDish.image)" class="dialog-image"></el-image>
          <!-- 料理の価格を表示 -->
          <p class="dialog-price">価格：￥{{ selectedDish.price.toFixed(2) }}</p>
          <div class="quantity-section">
            <!-- 数量を選択 -->
            <el-input-number v-model="selectedQuantity" :min="1" label="数量" class="quantity-input"></el-input-number>
            <div class="total-price">総額：￥{{ (selectedDish.price * selectedQuantity).toFixed(2) }}</div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <!-- キャンセルボタン -->
          <el-button type="danger" @click="dialogVisible = false" class="dialog-cancel">キャンセル</el-button>
          <!-- 確定ボタン -->
          <el-button type="primary" @click="confirmAddToCart" class="dialog-confirm">確定</el-button>
        </span>
      </el-dialog>
      <!-- 订单历史按钮，右上角 -->
      <div class="order-history-button">
        <el-button type="info" icon="el-icon-document" @click="toggleOrderHistory">注文履歴</el-button>
      </div>
      <!-- 订单历史侧边栏 -->
      <OrderHistorySidebar v-if="showOrderHistorySidebar" @close="toggleOrderHistory" :orders="orders"
        @confirmPayment="confirmPayment" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HeadLable from '@/components/HeadLable/index.vue'
import {
  getDishPage,
  editDish,
  deleteDish,
  dishStatusByStatus,
  dishCategoryList
} from '@/api/dish'
import request from '@/utils/request'
import InputAutoComplete from '@/components/InputAutoComplete/index.vue'
import { number } from 'echarts'
import { config } from '@vue/test-utils'
import { mapActions, mapGetters } from 'vuex'
import { mapGetters } from 'vuex'
import OrderHistorySidebar from '@/components/OrderHistorySidebar/index.vue'
import { getListByOrderId ,updatePayStatus} from '@/api/order'; // 引入 API 请求方法
// API请求方法定义
export const putOrderList = (params: any) =>
  request({
    'url': '/order/orderList',
    'method': 'put',
    'data': params
  })

@Component({
  name: 'DishType',
  components: {
    OrderHistorySidebar,
    HeadLable,
    InputAutoComplete,
  }
})
export default class extends Vue {
  private input: any = ''  // 入力された検索値（初期値は空）

  private page: number = 1  // 現在のページ番号
  private pageSize: number = 8  // 1ページに表示する料理の数
  private dialogVisible: boolean = false;  // ダイアログの表示状態を制御
  private selectedDish: any = null;  // 現在選択されている料理
  private selectedQuantity: number = 1;  // 現在選択されている料理の数量
  private tableData: [] = []  // 料理データを格納する配列
  private categoryId: number | null = 19;  // 現在選択されている料理のカテゴリID
  private dishStatus: number | null = 0;  // 現在の料理の状態
  private showOrderHistorySidebar: boolean = false; // 控制订单历史侧边栏显示状态
  private dishState = ''  // 料理の状態（未使用）
  private dishCategoryList = []  // 料理のカテゴリリスト（未使用）
  private checkList: string[] = []  // チェックされた料理IDリスト（未使用）
  private isSearch: boolean = false  // 検索状態かどうか（未使用）
  private saleStatus: any = [
    { value: 0, label: '料理' },
    { value: 1, label: 'その他' },
  ];  // 販売状態（未使用）
  private counts: number = 0  // 料理の総数
  private orders: any[] = []; // 用于存储通过 API 获取的订单列表

  computed = {
    ...mapGetters('order', ['getOrderList']),  // Vuexから注文リストを取得
  }

  get orderList() {
    return this.$store.getters['order/getOrderList'] || [];  // 注文リストを取得（デフォルトは空配列）
  }
  get orderId() {
    return this.$store.getters['order/getOrderId'];
  }

  addOrderItem(orderItem) {
    this.$store.dispatch('order/addOrderItem', orderItem);  // Vuexのアクションを使って注文アイテムを追加
  }

  created() {
    this.init();
    this.fetchOrderList(); 
    console.log(this.orders) // ページロード時にデータを初期化
  }
  // private async fetchOrderList() {
  //   try {
  //     const response = await getListByOrderId();
  //     if (response.data.code === 1) {
  //       this.orders = response.data.data; // 设置订单列表数据
  //     } else {
  //       this.$message.error('无法获取订单列表数据: ' + response.data.msg);
  //     }
  //   } catch (error) {
  //     this.$message.error('获取订单列表失败，请稍后重试。');
  //     console.error('获取订单列表时发生错误:', error);
  //   }
  // }
  fetchOrderList() {
    getListByOrderId(this.orderId).then(res => {
      if (res.data.code === 1) {
        this.orders = res.data.data;
        const mergedOrders = [];

      this.orders.forEach(order => {
        // 查找已合并的菜品中是否有相同菜名的菜品
        const existingOrder = mergedOrders.find(o => o.name === order.name);

        if (existingOrder) {
          // 如果找到了相同菜品，增加数量
          existingOrder.quantity += order.quantity;
        } else {
          // 如果没有找到相同菜品，直接添加
          mergedOrders.push({ ...order });
        }
      });

      // 将合并后的数据赋值回 this.orders
      this.orders = mergedOrders;
      } else {
        this.$message.error('无法获取订单列表数据: ' + res.data.msg);
      }
    }).catch(error => {
      this.$message.error('获取订单列表失败，请稍后重试。');
      console.error('获取订单列表时发生错误:', error);
    }
    )
    
    console.log(this.orderId)
  }

  // 初期化関数、検索値を受け取って再初期化
  initProp(val) {
    this.input = val  // 検索値を設定
    this.initFun()  // 再初期化
  }

  // 初期化関数、ページ番号をリセットしてデータを再読み込み
  initFun() {
    this.page = 1  // ページ番号を1にリセット
    this.init()  // データを再読み込み
  }
  private handleSizeChange(val: any) {
    this.pageSize = val;
    this.init();
  }

  private handleCurrentChange(val: any) {
    this.page = val;
    this.init();
  }

  // 料理データを読み込み、条件に基づいてフィルタリング
  private async init(isSearch?) {
    this.isSearch = isSearch  // 検索状態を設定
    await getDishPage({
      page: this.page,
      pageSize: this.pageSize,
      name: this.input || undefined,  // 検索値があればその値でフィルタリング
      categoryId: this.categoryId || undefined,  // カテゴリIDでフィルタリング
      //status: this.dishStatus|| undefined  // 料理の状態でフィルタリング
    })
      .then(res => {
        if (res.data.code === 1) {
          this.tableData = res.data && res.data.data && res.data.data.records  // 料理データを設定
          this.counts = Number(res.data.data.total)  // 料理の総数を設定
        }
      })
      .catch(err => {
        this.$message.error('エラーが発生しました：' + err.message)  // エラーハンドリング
      })
  }

  // カテゴリ選択ボタンがクリックされた時の処理
  private selectCategory(category: any) {
    this.categoryId = category;  // 現在の料理カテゴリを設定
    this.init();  // データを再読み込み
  }

  // 料理を選択してダイアログを開く
  private openDialog(item: any) {
    this.selectedDish = item;  // 現在選択されている料理を設定
    this.selectedQuantity = 1;  // デフォルト数量は1
    this.dialogVisible = true;  // ダイアログを表示
  }

  // 料理を注文リストに追加する処理
  private confirmAddToCart() {
    const orderList = this.orderList;  // 現在の注文リストを取得

    const existingItem = orderList.find(item => item.dish.id === this.selectedDish.id);  // 同じ料理が既に注文リストにあるか確認

    if (existingItem) {
      // 既に注文リストにある場合、数量を増やす
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + this.selectedQuantity };
      this.addOrderItem(updatedItem);  // 更新された注文アイテムをリストに追加
      this.$message.success(`${this.selectedDish.name} が注文リストに追加されました。数量：${updatedItem.quantity}`);  // 成功メッセージ
    } else {
      // 注文リストにない場合、新しく追加
      const orderItem = {
        dish: this.selectedDish,
        quantity: this.selectedQuantity,
      };
      this.addOrderItem(orderItem);  // 新しい注文アイテムをリストに追加
      this.$message.success(`${this.selectedDish.name} が注文リストに追加されました。数量：${this.selectedQuantity}`);  // 成功メッセージ
    }

    this.dialogVisible = false;  // ダイアログを閉じる
  }

  // 注文確認ボタンがクリックされた時の処理
  private confirmOrder() {
    if (this.orderList.length === 0) {
      this.$message.warning('注文リストに料理を追加してください！');  // 注文リストが空の場合の警告
      return;
    }
    // 注文確認ページに遷移
    this.$router.push({
      path: '/order-confirmation',
    });
  }

  // 切换订单历史侧边栏显示状态
  private toggleOrderHistory() {
    this.showOrderHistorySidebar = !this.showOrderHistorySidebar;
  }

  // 确认支付按钮的处理
  private confirmPayment() {
    if (this.orders.length === 0) {
      this.$message.warning('订单列表为空，无法支付！');
      return;
    }

    // 支付逻辑可以和确认订单类似
    updatePayStatus(this.orderId).then(res =>{
      if(res.data.code === 1){
        this.$message.success('支付成功！');
        this.$store.dispatch('order/clearOrderList'); 
        this.showOrderHistorySidebar = false; // 支付成功后关闭侧边栏
        this.$router.push({ path: '/wellcome' });  
      }else{
        this.$message.error(res.data.msg);
      }
    }).catch(error => {
      this.$message.error('支付失敗しました。もう一度試してください。');
      console.error();
    });
    
    
    // this.$store.dispatch('order/updatePayState', 0);
    
  }

  // 料理の画像URLを取得
  private getImageUrl(image: any) {
    if (image instanceof Blob) {
      return URL.createObjectURL(image);  // Blobの場合、URLを生成して返す
    }
    if (typeof image === 'string' && image.startsWith('iVBOR')) {
      return `data:image/png;base64,${image}`;  // Base64エンコードされた画像の場合、データURLを返す
    }
    return image;  // その他の場合、そのまま画像URLを返す
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  margin: 30px;

  .container {
    background: #fff;
    position: relative;
    z-index: 1;
    padding: 30px 28px;
    border-radius: 4px;

    .normal-btn {
      background: #333;
      color: white;
      margin-left: 20px;
    }

    .tableBar {
      margin-bottom: 20px;
    }

    .category-buttons {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-start;

      .category-button {
        width: 15%;
        margin-right: 10px;
      }
    }

    .dish-card {
      margin-bottom: 20px;

      .dish-info {
        margin: 10px 0;

        h4 {
          font-size: 16px;
          font-weight: bold;
        }

        .dish-price {
          color: #e60012;
          font-size: 14px;
        }
      }
    }

    .confirm-order-button {
      text-align: right;
      margin-top: 20px;
      position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 10;

      .el-button {
        width: auto;
        height: 40px;
      }
    }
  }

  .order-history-button {
    position: absolute;
    top: 20px;
    right: 20px;
  }
}
</style>
