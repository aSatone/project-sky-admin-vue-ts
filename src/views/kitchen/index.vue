<template>
    <div class="dashboard-container">
        <div class="container">
            <!-- 注文リスト -->
            <el-table 
                :data="orders" 
                style="width: 100%" 
                :row-class-name="getRowClassName"
            >
                <!-- 料理列 -->
                <el-table-column label="料理">
                    <template slot-scope="scope">
                        <span v-if="scope.row.displayName">{{ scope.row.displayName }}</span>
                    </template>
                </el-table-column>
                <!-- 数量列 -->
                <el-table-column label="数量" prop="quantity"></el-table-column>
                <!-- テーブル番号列 -->
                <el-table-column label="テーブル番号" prop="tableId"></el-table-column>
                <!-- 待機時間列 -->
                <el-table-column label="注文からの待機時間">
                    <template slot-scope="scope">
                        {{ formatWaitTime(scope.row.orderTime) }}
                    </template>
                </el-table-column>
                <!-- 操作列 -->
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="warning" size="small" @click="markAsServed(scope.row)">料理済み</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getOrders, deleteKitchenItem } from '@/api/order'

@Component({
    name: 'KitchenManagement',
})
export default class KitchenManagement extends Vue {
    private orders: Array<any> = [] // 処理された注文データの保存

    // ページロード時に呼び出し
    created() {
        this.fetchOrders()
    }

    // 注文データを取得して処理
    private fetchOrders() {
        getOrders()
            .then(res => {
                if (res.data.code === 1) {
                    // 注文データを処理
                    this.orders = this.processOrders(res.data.data)
                } else {
                    this.$message.error('注文の取得に失敗しました')
                }
            })
            .catch(err => {
                this.$message.error('リクエスト失敗：' + err.message)
            })
    }

    // 注文データを処理：グループ化、並べ替え、表示最適化
    private processOrders(orderData: Array<any>) {
        const groupedOrders: Record<string, any[]> = {}

        // 料理名でグループ化
        orderData.forEach(order => {
            const trimmedName = order.name.trim() // 余分な空白を削除してグループ化の誤りを防ぐ
            if (!groupedOrders[trimmedName]) {
                groupedOrders[trimmedName] = []
            }
            groupedOrders[trimmedName].push(order)
        })

        // 各グループ内で待機時間を並べ替え（昇順）
        Object.keys(groupedOrders).forEach(name => {
            groupedOrders[name].sort((a, b) => {
                return new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime() // 時間を昇順に
            })
        })

        // 配列に展開して表示ロジックを設定
        const processedOrders: Array<any> = []
        Object.values(groupedOrders).forEach(group => {
            group.forEach((order, index) => {
                processedOrders.push({
                    ...order,
                    displayName: index === 0 ? order.name : null, // グループ内の最初の料理名のみ表示
                })
            })
        })

        return processedOrders
    }

    // 待機時間のフォーマット
    private formatWaitTime(orderTime: string): string {
        const timeDiff = (new Date().getTime() - new Date(orderTime).getTime()) / 60000 // 分に変換
        return timeDiff < 60 ? `${Math.floor(timeDiff)} 分` : `${(timeDiff / 60).toFixed(1)} 時間`
    }

    // 料理済みとしてマーク
    private markAsServed(order: any) {
        // 注文状態を更新するAPIがあると仮定
        deleteKitchenItem(order.id)
        .then(res => {
                if (res.data.code === 1) {
                    // 注文データを処理
                    this.$message.success(`料理【${order.name}】を料理済みとしてマークしました！`)
                } else {
                    this.$message.error('注文の取得に失敗しました')
                }
            })
            .catch(err => {
                this.$message.error('リクエスト失敗：' + err.message)
            })
    }

    // カスタム行スタイル：同じ料理の間の境界線を非表示にする
    private getRowClassName({ row, rowIndex }: { row: any; rowIndex: number }): string {
        if (rowIndex === 0) return '' // 最初の行は常に境界線を表示
        const prevRow = this.orders[rowIndex - 1] // 前の行データを取得
        return prevRow && row.name === prevRow.name ? 'no-border' : ''
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

        .el-button {
            color: #fff;
        }

        // テーブル行の境界線を非表示にする
        .el-table__row.no-border .el-table__row--striped {
            border-bottom: none !important;
        }
    }
}
</style>
