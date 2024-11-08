<template>
  <div class="user-welcome">
    <!-- 欢迎标题 -->
    <h1 class="table-number">欢迎光临餐厅！</h1>

    <!-- 随机桌号 -->
    <div class="table-number">
      <h2>您的桌号是：{{ tableNumber }}</h2>
      <!-- <el-button type="primary" @click="generateTableNumber">重新生成桌号</el-button> -->
    </div>

    <!-- 人数选择 -->
    <div class="guest-selection">
      <h2>请选择就餐人数：</h2>
      <el-select v-model="guestCount" placeholder="请选择人数">
        <el-option v-for="n in 10" :key="n" :label="n + ' 人'" :value="n"></el-option>
      </el-select>
    </div>

    <!-- 确认按钮 -->
    <div class="confirm-button">
      <el-button type="success" @click="confirmDetails">确认并继续点餐</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Message } from 'element-ui';


@Component
export default class UserWelcome extends Vue {
  // 桌号
  private tableNumber: number = this.generateRandomTableNumber()

  // 就餐人数
  private guestCount: number | null = null

  // 生成随机桌号
  private generateRandomTableNumber(): number {
    return Math.floor(Math.random() * 50) + 1 // 假设桌号在 1 到 50 之间
  }

  // 点击按钮生成新桌号
  private generateTableNumber() {
    this.tableNumber = this.generateRandomTableNumber()
  }

  // 确认人数和桌号
  private confirmDetails() {
    if (this.guestCount === null) {
      Message.error('请选择就餐人数！')
    } else {
      Message.success(`桌号 ${this.tableNumber}，人数 ${this.guestCount}，欢迎用餐！`)
      // 在此处可以继续导航到点餐页面
      this.$router.push({ path: '/order' });
    }
   
  }
}
</script>

<style scoped lang="scss">
.user-welcome {
  text-align: center;
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
