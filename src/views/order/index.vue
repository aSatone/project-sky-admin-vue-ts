<template>
  <div class="dashboard-container">
    <div class="container">

      <!-- カテゴリ選択ボタン -->
      <div class="category-buttons">
        <!-- 日本料理ボタン -->
        <el-button :type="dishStatus === 0 ? 'primary' : 'default'"
                   @click="selectCategory(0)"
                   class="category-button">
                   日本料理
        </el-button>
        <!-- 中華料理ボタン -->
        <el-button :type="dishStatus === 1 ? 'primary' : 'default'"
                   @click="selectCategory(1)"
                   class="category-button">
                   中華料理
        </el-button>
        <!-- 西洋料理ボタン -->
        <el-button :type="dishStatus === 2 ? 'primary' : 'default'"
                   @click="selectCategory(2)"
                   class="category-button">
          西洋料理
        </el-button>
      </div>

      <!-- カードレイアウトで料理を表示 -->
      <el-row :gutter="20" v-if="tableData.length">
        <el-col :span="6" v-for="(item, index) in tableData" :key="index">
          <el-card :body-style="{ padding: '10px' }" class="dish-card">
            <!-- 料理画像を表示、クリックするとダイアログを開く -->
            <el-image :src="getImageUrl(item.image)"
                      style="width: 100%; height: 180px; cursor: pointer"
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
import InputAutoComplete from '@/components/InputAutoComplete/index.vue'
import { number } from 'echarts'
import { config } from '@vue/test-utils'
import { mapActions, mapGetters } from 'vuex'

@Component({
  name: 'DishType',
  components: {
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
  private categoryId = ''  // 現在選択されている料理のカテゴリID
  private dishStatus: number | null = 0;  // 現在の料理の状態

  private dishState = ''  // 料理の状態（未使用）
  private dishCategoryList = []  // 料理のカテゴリリスト（未使用）
  private checkList: string[] = []  // チェックされた料理IDリスト（未使用）
  private isSearch: boolean = false  // 検索状態かどうか（未使用）
  private saleStatus: any = [
    { value: 0, label: '料理' },
    { value: 1, label: 'その他' },
  ];  // 販売状態（未使用）
  private counts: number = 0  // 料理の総数

  computed = {
    ...mapGetters('order', ['getOrderList']),  // Vuexから注文リストを取得
  }

  get orderList() {
    return this.$store.getters['order/getOrderList'] || [];  // 注文リストを取得（デフォルトは空配列）
  }

  addOrderItem(orderItem) {
    this.$store.dispatch('order/addOrderItem', orderItem);  // Vuexのアクションを使って注文アイテムを追加
  }

  created() {
    this.init();  // ページロード時にデータを初期化
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

  // 料理データを読み込み、条件に基づいてフィルタリング
  private async init(isSearch?) {
    this.isSearch = isSearch  // 検索状態を設定
    await getDishPage({
      page: this.page,
      pageSize: this.pageSize,
      name: this.input || undefined,  // 検索値があればその値でフィルタリング
      categoryId: this.categoryId || undefined,  // カテゴリIDでフィルタリング
      status: this.dishStatus  // 料理の状態でフィルタリング
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
  private selectCategory(category: number) {
    this.dishStatus = category;  // 現在の料理カテゴリを設定
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
.dashboard {
  &-container {
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

        .el-button {
          width: 20%;
          height: 40px;
        }
      }
    }
  }
}
</style>
