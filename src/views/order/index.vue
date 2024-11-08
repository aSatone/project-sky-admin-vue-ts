<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar">
        <label style="margin-right: 10px">菜品名称：</label>
        <el-input v-model="input"
                  placeholder="请填写菜品名称"
                  style="width: 14%"
                  clearable
                  @clear="init"
                  @keyup.enter.native="initFun" />

        <el-button class="normal-btn continue"
                   @click="init(true)">
          查询
        </el-button>
      </div>

      <!-- 新增的菜类和其他选择按钮 -->
      <div class="category-buttons">
        <el-button :type="dishStatus === 0 ? 'primary' : 'default'"
                   @click="selectCategory(0)"
                   class="category-button">
          菜类
        </el-button>
        <el-button :type="dishStatus === 1 ? 'primary' : 'default'"
                   @click="selectCategory(1)"
                   class="category-button">
          其他
        </el-button>
      </div>

      <!-- 使用卡片布局展示菜品 -->
      <el-row :gutter="20" v-if="tableData.length">
        <el-col :span="6" v-for="(item, index) in tableData" :key="index">
          <el-card :body-style="{ padding: '10px' }" class="dish-card">
            <el-image :src="getImageUrl(item.image)"
                      style="width: 100%; height: 180px; cursor: pointer"
                      @click="openDialog(item)">
              <div slot="error" class="image-slot">
                <img src="./../../assets/noImg.png" style="width: auto; height: 180px; border: none">
              </div>
            </el-image>
            <div class="dish-info">
              <h4>{{ item.name }}</h4>
              <p class="dish-price">￥{{ item.price.toFixed(2) }}</p>
            </div>
            <!-- 修改按钮文本为“注文リスト追加” -->
            <el-button type="primary" size="mini" @click="openDialog(item)">注文リスト追加</el-button>
          </el-card>
        </el-col>
      </el-row>
      <Empty v-else :is-search="isSearch" />
      <el-pagination v-if="counts > 10"
                     class="pageList"
                     :page-sizes="[8, 16, 24, 32]"
                     :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="counts"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange" />

      <!-- 新增的注文确认按钮 -->
      <div class="confirm-order-button">
        <el-button type="success" @click="confirmOrder">注文确认</el-button>
      </div>

      <!-- 弹出对话框 -->
      <el-dialog :visible.sync="dialogVisible" width="30%" :title="selectedDish && selectedDish.name" :modal="false">
        <div v-if="selectedDish" class="dialog-content">
          <el-image :src="getImageUrl(selectedDish.image)" class="dialog-image"></el-image>
          <p class="dialog-price">价格：￥{{ selectedDish.price.toFixed(2) }}</p>
          <div class="quantity-section">
            <el-input-number v-model="selectedQuantity" :min="1" label="数量" class="quantity-input"></el-input-number>
            <div class="total-price">总价：￥{{ (selectedDish.price * selectedQuantity).toFixed(2) }}</div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="danger" @click="dialogVisible = false" class="dialog-cancel">取消</el-button>
          <el-button type="primary" @click="confirmAddToCart" class="dialog-confirm">确定</el-button>
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
//import Empty from '@/components/Empty/index.vue'
//import { baseUrl } from '@/config.json'import Empty from '@/components/Empty/index.vue';

@Component({
  name: 'DishType',
  components: {
    HeadLable,
    InputAutoComplete,
    //Empty
  }
})
export default class extends Vue {
  private input: any = ''
  private counts: number = 0
  private page: number = 1
  private pageSize: number = 8
  private checkList: string[] = []
  private tableData: [] = []
  private dishState = ''
  private dishCategoryList = []
  private categoryId = ''
  private dishStatus: number | null = 0; // 默认选择“菜类”
  private isSearch: boolean = false
  private saleStatus: any = [
    { value: 0, label: '菜类' },
    { value: 1, label: '其他' },
  ];
  private dialogVisible: boolean = false;
  private selectedDish: any = null;
  private selectedQuantity: number = 1;

  // 在页面加载时默认选择菜类
  created() {
    this.init();
  }

  initProp(val) {
    this.input = val
    this.initFun()
  }

  initFun() {
    this.page = 1
    this.init()
  }

  private async init(isSearch?) {
    this.isSearch = isSearch
    await getDishPage({
      page: this.page,
      pageSize: this.pageSize,
      name: this.input || undefined,
      categoryId: this.categoryId || undefined,
      status: this.dishStatus
    })
      .then(res => {
        if (res.data.code === 1) {
          this.tableData = res.data && res.data.data && res.data.data.records
          this.counts = Number(res.data.data.total)
        }
      })
      .catch(err => {
        this.$message.error('请求出错了：' + err.message)
      })
  }

  // 选择分类按钮点击事件
  private selectCategory(category: number) {
    this.dishStatus = category;
    this.init();
  }

  private openDialog(item: any) {
    this.selectedDish = item;
    this.selectedQuantity = 1;
    this.dialogVisible = true;
  }

  private addDishtype(st: string) {
    if (st === 'add') {
      this.$router.push({ path: '/dish/add' })
    } else {
      this.$router.push({ path: '/dish/add', query: { id: st } })
    }
  }

  private confirmAddToCart() {
    this.$message.success(`${this.selectedDish.name} 已加入注文リスト，数量：${this.selectedQuantity}`);
    this.dialogVisible = false;
  }

  // 新增的注文确认方法
  private confirmOrder() {
    this.$message.success('您的订单已确认！');
    // 可以在这里实现后续的订单确认逻辑
  }

  private handleSizeChange(val: any) {
    this.pageSize = val;
    this.init();
  }

  private handleCurrentChange(val: any) {
    this.page = val;
    this.init();
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
          width: 30%;
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
