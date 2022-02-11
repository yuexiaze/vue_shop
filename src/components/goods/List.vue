<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <el-table :data="goodsList" border stripe >
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="129px"></el-table-column>
        <el-table-column label="商品数量" prop="goods_number" width="80px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="130px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEdit(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background >
      </el-pagination>
    </el-card>
    <!-- 编辑商品 -->
    <el-dialog
    title="编辑"
    :visible.sync="editDialogVisible"
    width="50%"
    @closed="editDialogClosed"
    > 
      <el-form :model="editGoodsFrom" :rules="editGoodsFormRules" ref="editGoodsFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editGoodsFrom.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="goods_number">
          <el-input v-model="editGoodsFrom.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="goods_number">
          <el-input v-model="editGoodsFrom.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="重量" prop="goods_number">
          <el-input v-model="editGoodsFrom.goods_weight" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:10
      },
      goodsList:[],
      editGoodsFrom:{
        goods_name:'',
        goods_id:0,
        goods_price:0,
        goods_number:0,
        goods_weight:0,
      },
      total:0,
      editDialogVisible:false,
      editGoodsFormRules:{
        goods_name:[{
          required:true,message:'请输入新名称',trigger:'blur'
        }],
        goods_number:[{
          required:true,message:'请输入数字',trigger:'blur'
        }]
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //根据分页获取对应商品列表
    async getGoodsList(){
      const{data:res}=await this.$http.get('goods',{params:this.queryInfo})
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      this.$message.success("获取商品列表成功")
      this.goodsList=res.data.goods
      this.total=res.data.total
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage
      this.getGoodsList()
    },
    async removeById(id){
       const confirmResult=await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmResult!=='confirm'){
          return this.$message.info('已取消删除')
        }

      const{data:res}=await this.$http.delete(`goods/${id}`)
      if(res.meta.status!==200){
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.getGoodsList()
    },
    goAddpage(){
      this.$router.push('/goods/add')
    },
    showEdit(goods){
      this.editDialogVisible=true
      this.editGoodsFrom.goods_id=goods.goods_id
      this.editGoodsFrom.goods_name=goods.goods_name
      this.editGoodsFrom.goods_price=goods.goods_price
      this.editGoodsFrom.goods_number=goods.goods_number
      this.editGoodsFrom.goods_weight=goods.goods_weight
    },
    async edit(){
      const{data:res}=await this.$http.put(`goods/${this.editGoodsFrom.goods_id}`,{
        goods_name:this.editGoodsFrom.goods_name,
        goods_price:this.editGoodsFrom.goods_price,
        goods_number:this.editGoodsFrom.goods_number,
        goods_weight:this.editGoodsFrom.goods_weight
      })
      if(res.meta.status!==201){
          return this.$message.error('修改失败')
        }
      this.editDialogVisible=false
    },
    editDialogClosed(){
      this.$refs.editGoodsFormRef.resetFields()
    }
  },
}
</script>

<style lang="less" scoped>

</style>