<template>
  <div class="welcome-container">
    <!-- 上 2/3 的幻灯片部分 -->
    <div class="carousel-container" @click="goToUserPage">
      <el-carousel indicator-position="outside" height="66vh" arrow="never">
        <el-carousel-item v-for="(image, index) in images" :key="index">
          <div class="slide" :style="{ backgroundImage: `url(${image})` }"></div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 分割线部分 -->
    <div class="divider"></div>

    <!-- 下 1/3 的固定图片部分 -->
    <div class="bottom-fixed-image" @click="goToUserPage">
      <img :src="bottomImage" alt="固定图片" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getPayStatus } from '@/api/order';

@Component({
  name: 'Welcome'
})
export default class Welcome extends Vue {
  // 修改 payStatus 为 number 类型
  private payStatus: number | null = null;

  // 设置好要展示的图片
  private images: string[] = [
    require('@/assets/image1.jpg'),
    require('@/assets/image2.jpg'),
    require('@/assets/image3.jpg')
  ];

  // 底部固定展示的图片
  private bottomImage: string = require('@/assets/fixedImage.jpg');

  // 在组件创建时获取支付状态
  created() {
    this.fetchPayStatus();
  }

  // 获取支付状态的函数
  private async fetchPayStatus() {
    try {
      const tableId = 11; // 假设 tableId 是桌号

      // 如果没有桌号，提示用户
      if (!tableId) {
        this.$message.error("桌号未设置，请检查！");
        return;
      }

      const res = await getPayStatus({ tableId });

      if (res.data.code === 1) {
        // 获取支付状态成功
        this.payStatus = res.data.data;  // 这里假设 data 是一个数字类型
      } else {
        this.payStatus= 1;
      }
    } catch (err) {
      this.payStatus= 1;
    }
  }

  // 点击任何地方跳转到用户页面
  private goToUserPage() {
    console.log(this.payStatus);
    if (this.payStatus === 1) {  // 假设 1 为已支付状态
      this.$router.push({ path: '/user' });
    } else {
      this.$router.push({ path: '/order' });
    }
  }
}
</script>

<style scoped>
.welcome-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.carousel-container {
  width: 100%;
  height: 66vh;
  /* 上方幻灯片占据页面的 2/3 */
  cursor: pointer;
  /* 显示手型鼠标，提示可以点击 */
}

.slide {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.divider {
  width: 100%;
  height: 8px;
  /* 调整为较大的高度，类似于装饰条 */
  background: linear-gradient(to right, #ff0000, #ff6600);
  /* 渐变色分割线 */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  /* 添加阴影效果，让分割线更突出 */
  position: relative;
  /* 确保分割线在正确的位置 */
}

.bottom-fixed-image {
  width: 100%;
  height: 34vh;
  /* 下方图片占据页面的 1/3 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.bottom-fixed-image img {
  width: 100%;
  /* 拉伸图片，使其宽度占满容器 */
  height: 100%;
  /* 拉伸图片，使其高度占满容器 */
  object-fit: fill;
  /* 图片完全填满，不保持比例 */
}
</style>
