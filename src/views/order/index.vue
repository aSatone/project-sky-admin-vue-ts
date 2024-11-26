<template>
  <div class="dashboard-container">
    <div class="container">

      <!-- 分类选择按钮 -->
      <div class="category-buttons">
        <!-- 日本料理按钮 -->
        <el-button :type="dishStatus === 0 ? 'primary' : 'default'"
                   @click="selectCategory(0)"
                   class="category-button">
                   日本料理
        </el-button>
        <!-- 中华料理按钮 -->
        <el-button :type="dishStatus === 1 ? 'primary' : 'default'"
                   @click="selectCategory(1)"
                   class="category-button">
                   中华料理
        </el-button>
        <!-- 西洋料理按钮 -->
        <el-button :type="dishStatus === 2 ? 'primary' : 'default'"
                   @click="selectCategory(2)"
                   class="category-button">
          西洋料理
        </el-button>
      </div>

      <!-- 卡片布局显示菜品 -->
      <el-row :gutter="20" v-if="tableData.length">
        <el-col :span="6" v-for="(item, index) in tableData" :key="index">
          <el-card :body-style="{ padding: '10px' }" class="dish-card">
            <!-- 显示菜品图片，点击打开对话框 -->
            <el-image :src="getImageUrl(item.image)"
                      style="width: 100%; height: 180px; cursor: pointer"
                      @click="openDialog(item)">
              <div slot="error" class="image-slot">
                <img src="./../../assets/noImg.png" style="width: auto; height: 180px; border: none">
              </div>
            </el-image>
            <!-- 显示菜名和价格 -->
            <div class="dish-info">
              <h4>{{ item.name }}</h4>
              <p class="dish-price">￥{{ item.price.toFixed(2) }}</p>
            </div>
            <!-- 将菜品添加到订单列表的按钮 -->
            <el-button type="primary" size="mini" @click="openDialog(item)">加入订单列表</el-button>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 订单确认按钮和订单历史按钮 -->
      <div class="confirm-order-button">
        <el-button type="success" @click="confirmOrder">确认订单</el-button>
        <el-button type="info" @click="goToOrderHistory">订单历史</el-button>
      </div>

      <!-- 对话框的样式 -->
      <el-dialog :visible.sync="dialogVisible" width="30%" :title="selectedDish && selectedDish.name" :modal="false">
        <div v-if="selectedDish" class="dialog-content">
          <!-- 显示菜品图片 -->
          <el-image :src="getImageUrl(selectedDish.image)" class="dialog-image"></el-image>
          <!-- 显示菜品价格 -->
          <p class="dialog-price">价格：￥{{ selectedDish.price.toFixed(2) }}</p>
          <div class="quantity-section">
            <!-- 选择数量 -->
            <el-input-number v-model="selectedQuantity" :min="1" label="数量" class="quantity-input"></el-input-number>
            <div class="total-price">总价：￥{{ (selectedDish.price * selectedQuantity).toFixed(2) }}</div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <!-- 取消按钮 -->
          <el-button type="danger" @click="dialogVisible = false" class="dialog-cancel">取消</el-button>
          <!-- 确定按钮 -->
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
import request from '@/utils/request'
import InputAutoComplete from '@/components/InputAutoComplete/index.vue'
import { mapGetters } from 'vuex'

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
    HeadLable,
    InputAutoComplete,
  }
})
export default class extends Vue {
  private input: any = ''  // 输入的搜索值（初始为空）
  
  private page: number = 1  // 当前页码
  private pageSize: number = 8  // 每页显示菜品数量
  private dialogVisible: boolean = false;  // 控制对话框的显示状态
  private selectedDish: any = null;  // 当前选择的菜品
  private selectedQuantity: number = 1;  // 当前选择的菜品数量
  private tableData: [] = []  // 存储菜品数据的数组
  private categoryId = ''  // 当前选择的菜品分类ID
  private dishStatus: number | null = 0;  // 当前的菜品状态

  computed = {
    ...mapGetters('order', ['getOrderList']),  // 从Vuex获取订单列表
  }

  get orderList() {
    return this.$store.getters['order/getOrderList'] || [];  // 获取订单列表（默认是空数组）
  }

  addOrderItem(orderItem) {
    this.$store.dispatch('order/addOrderItem', orderItem);  // 使用Vuex的action添加订单项
  }

  created() {
    this.init();  // 页面加载时初始化数据
  }

  // 初始化函数，重置页码并重新加载数据
  initFun() {
    this.page = 1  // 页码重置为1
    this.init()  // 重新加载数据
  }

  // 异步加载菜品数据
  private async init() {
    await getDishPage({
      page: this.page,
      pageSize: this.pageSize,
      name: this.input || undefined,  // 使用搜索值过滤
      categoryId: this.categoryId || undefined,  // 使用分类ID过滤
      status: this.dishStatus  // 通过菜品状态过滤
    })
      .then(res => {
        if (res.data.code === 1) {
          this.tableData = res.data && res.data.data && res.data.data.records  // 设置菜品数据
        }
      })
      .catch(err => {
        this.$message.error('发生错误：' + err.message)  // 错误处理
      })
  }

  // 选择菜品分类时的处理
  private selectCategory(category: number) {
    this.dishStatus = category;  // 设置当前菜品分类
    this.init();  // 重新加载数据
  }

  // 打开选择的菜品对话框
  private openDialog(item: any) {
    this.selectedDish = item;  // 设置当前选择的菜品
    this.selectedQuantity = 1;  // 默认数量为1
    this.dialogVisible = true;  // 显示对话框
  }

  // 确认将菜品加入订单
  private confirmAddToCart() {
    const orderList = this.orderList;  // 获取当前订单列表
    const existingItem = orderList.find(item => item.dish.id === this.selectedDish.id);  // 查找是否已存在

    if (existingItem) {
      // 如果订单列表中已经存在，增加数量
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + this.selectedQuantity };
      this.addOrderItem(updatedItem);  // 更新后的订单项添加到列表
      this.$message.success(`${this.selectedDish.name} 已添加到订单列表。数量：${updatedItem.quantity}`);  // 成功消息
    } else {
      // 如果不存在，则新增
      const orderItem = {
        dish: this.selectedDish,
        quantity: this.selectedQuantity,
      };
      this.addOrderItem(orderItem);  // 新订单项添加到列表
      this.$message.success(`${this.selectedDish.name} 已添加到订单列表。数量：${this.selectedQuantity}`);  // 成功消息
    }

    this.dialogVisible = false;  // 关闭对话框
  }

  // 确认订单时的处理逻辑
  private confirmOrder() {
    if (this.orderList.length === 0) {
      this.$message.warning('请先将菜品添加到订单列表中！');  // 订单列表为空时提示
      return;
    }
    
    // 构造请求数据 payload
    const payload = {
      orderItems: this.orderList.map(item => ({
        dishId: item.dish.id,
        quantity: item.quantity
      }))
    };

    // 发送订单数据的API请求
    putOrderList(payload).then(res => {
      if (res.data.code === 1) {
        this.$message.success('订单已确认！');  // 提交成功后提示

        // 清空订单列表并更新支付状态
        this.$store.dispatch('order/clearOrderList'); 
        this.$store.dispatch('order/updatePayState', 0);

        // 跳转到欢迎页面
        this.$router.push({ path: '/welcome' });
      } else {
        this.$message.error(res.data.msg);  // 提交失败时提示错误信息
      }
    }).catch(error => {
      this.$message.error('订单确认失败，请稍后重试。');  // 捕获请求失败的错误
      console.error('确认订单时发生错误:', error);
    });
  }

  // 跳转到订单历史页面
  private goToOrderHistory() {
    this.$router.push({
      path: '/order-history',
    });
  }

  // 获取菜品图片URL
  private getImageUrl(image: any) {
    if (image instanceof Blob) {
      return URL.createObjectURL(image);  // Blob类型，生成URL
    }
    if (typeof image === 'string' && image.startsWith('iVBOR')) {
      return `data:image/png;base64,${image}`;  // Base64编码的图片
    }
    return image;  // 其他情况直接返回URL
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
          margin-left: 10px;  // 增加按钮间距
        }
      }
    }
  }
}
</style>
