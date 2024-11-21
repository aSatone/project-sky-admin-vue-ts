<template>
    <div class="dashboard-container">
        <div class="container">
            <!-- 订单列表 -->
            <el-table :data="orders" style="width: 100%" :default-sort="{ prop: 'waitTime', order: 'ascending' }">
                <el-table-column label="桌号" prop="tableId"></el-table-column>
                <el-table-column label="菜品" prop="dishName"></el-table-column>
                <el-table-column label="等待时间" prop="waitTime">
                    <template slot-scope="scope">
                        {{ formatWaitTime(scope.row.waitTime) }} 分钟
                    </template>
                </el-table-column>
                <el-table-column label="状态" prop="status"></el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getOrders } from '@/api/order'

@Component({
    name: 'KitchenManagement',
})
export default class extends Vue {
    private orders: Array<any> = [] // 存储订单数据

    // 获取当前订单并按等待时间排序
    private fetchOrders() {
        getOrders()
            .then(res => {
                if (res.data.code === 1) {
                    // 按等待时间排序
                    this.orders = res.data.data.sort((a: any, b: any) => a.waitTime - b.waitTime)
                }
            })
            .catch(err => {
                this.$message.error('获取订单列表失败：' + err.message)
            })
    }

    // 格式化等待时间
    private formatWaitTime(waitTime: number): string {
        return waitTime < 60 ? `${waitTime}` : `${(waitTime / 60).toFixed(1)} 小时`
    }

    created() {
        this.fetchOrders() // 页面加载时获取订单列表
    }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
    margin: 30px;

    .container {
        background: #fff;
        padding: 30px;
        border-radius: 4px;

        .el-table {
            width: 100%;
        }
    }
}
</style>