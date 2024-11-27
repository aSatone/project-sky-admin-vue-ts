<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar">
        <label style="margin-right: 10px">菜品名称：</label>
        <el-input
          v-model="input"
          placeholder="请填写菜品名称"
          style="width: 14%"
          clearable
          @clear="init"
          @keyup.enter.native="initFun"
        />

        <label style="margin-right: 10px; margin-left: 20px">菜品类别：</label>
        <el-select
          v-model="categoryId"
          style="width: 14%"
          placeholder="请选择"
          clearable
          @clear="init"
        >
          <el-option
            v-for="item in dishCategoryList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button class="normal-btn continue" @click="init(true)">
          查询
        </el-button>

        <div class="tableLab">
          <span class="delBut non" @click="deleteHandle('批量', null)"
            >批量删除</span
          >
          <el-button
            type="primary"
            style="margin-left: 15px"
            @click="addDishtype('add')"
          >
            + 新建菜品
          </el-button>
        </div>
      </div>
      <el-table
        v-if="tableData.length"
        :data="tableData"
        stripe
        class="tableBox"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="25" />
        <el-table-column prop="name" label="菜品名称" />
        <el-table-column prop="image" label="图片">
          <template slot-scope="{ row }">
            <el-image
              style="width: 80px; height: 40px; border: none; cursor: pointer"
              :src="getImageUrl(row.image)"
            >
              <div slot="error" class="image-slot">
                <img
                  src="./../../assets/noImg.png"
                  style="width: auto; height: 40px; border: none"
                />
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="售价">
          <template slot-scope="scope">
            <span style="margin-right: 10px"
              >￥{{ scope.row.price.toFixed(2) }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="菜品分类">
          <template slot-scope="scope">
            <div>{{ scope.row.categoryName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="最后操作时间" />
        <el-table-column label="操作" width="250" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              class="blueBug"
              @click="addDishtype(scope.row.id)"
            >
              修改
            </el-button>
            <el-button
              type="text"
              size="small"
              class="delBut"
              @click="deleteHandle('单删', scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Empty v-else :is-search="isSearch" />
      <el-pagination
        v-if="counts > 10"
        class="pageList"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="counts"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import {
  getDishPage,
  editDish,
  deleteDish,
  dishCategoryList
} from '@/api/dish'
import Empty from '@/components/Empty/index.vue'

@Component({
  name: 'DishType',
  components: {
    Empty
  }
})
export default class extends Vue {
  private input: string = ''
  private counts: number = 0
  private page: number = 1
  private pageSize: number = 10
  private checkList: string[] = []
  private tableData: any[] = []
  private categoryId = ''
  private dishCategoryList: any[] = []
  private isSearch: boolean = false

  created() {
    this.init()
    this.getDishCategoryList()
  }

  private async init(isSearch?: boolean) {
    this.isSearch = !!isSearch
    await getDishPage({
      page: this.page,
      pageSize: this.pageSize,
      name: this.input || undefined,
      categoryId: this.categoryId || undefined
    })
      .then((res) => {
        if (res.data.code === 1) {
          this.tableData = res.data.data.records.map((record: any) => {
            const category = this.dishCategoryList.find(
              (item: any) => item.value === record.categoryId
            )
            return {
              ...record,
              categoryName: category ? category.label : '未知分类'
            }
          })
          this.counts = Number(res.data.data.total)
        }
      })
      .catch((err) => {
        this.$message.error('请求出错了：' + err.message)
      })
  }

  private getDishCategoryList() {
    dishCategoryList({
      type: 1
    })
      .then((res) => {
        if (res && res.data && res.data.code === 1) {
          this.dishCategoryList = res.data.data.map((item: any) => {
            return { value: item.id, label: item.name }
          })
        }
      })
      .catch(() => {})
  }

  private handleSelectionChange(val: any) {
    this.checkList = val.map((n: any) => n.id)
  }

  private handleSizeChange(val: number) {
    this.pageSize = val
    this.init()
  }

  private handleCurrentChange(val: number) {
    this.page = val
    this.init()
  }

  private addDishtype(st: string) {
    if (st === 'add') {
      this.$router.push({ path: '/dish/add' })
    } else {
      this.$router.push({ path: '/dish/add', query: { id: st } })
    }
  }

  private deleteHandle(type: string, id: any) {
    if (type === '批量' && id === null) {
      if (this.checkList.length === 0) {
        return this.$message.error('请选择删除对象')
      }
    }
    this.$confirm('确认删除该菜品, 是否继续?', '确定删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      deleteDish(type === '批量' ? this.checkList.join(',') : id)
        .then((res) => {
          if (res && res.data && res.data.code === 1) {
            this.$message.success('删除成功！')
            this.init()
          } else {
            this.$message.error(res.data.msg)
          }
        })
        .catch(() => {
          this.$message.error('删除失败！')
        })
    })
  }

  private getImageUrl(image: any) {
    if (image instanceof Blob) {
      return URL.createObjectURL(image)
    }
    if (typeof image === 'string' && image.startsWith('iVBOR')) {
      return `data:image/png;base64,${image}`
    }
    return image
  }
}
</script>

<style lang="scss">
.el-table-column--selection .cell {
  padding-left: 10px;
}
</style>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
    .container {
      background: #fff;
      padding: 30px 28px;
      border-radius: 4px;
      .tableBar {
        margin-bottom: 20px;
        .tableLab {
          float: right;
          span {
            cursor: pointer;
            font-size: 14px;
            color: #666;
          }
        }
      }
      .tableBox {
        width: 100%;
        border: 1px solid #eee;
      }
      .pageList {
        text-align: center;
        margin-top: 30px;
      }
    }
  }
}
</style>
