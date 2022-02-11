<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>

      <!-- 选择商品分类区 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                @close="handleClose(i,scope.row)" >{{item}}</el-tag>
                <el-input
  class="input-new-tag"
  v-if="scope.row.inputVisible"
  v-model="scope.row.inputValue"
  ref="saveTagInput"
  size="small"
  @keyup.enter.native="handleInputConfirm(scope.row)"
  @blur="handleInputConfirm(scope.row)"
>
</el-input>
<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini"
                  @click="showEditDialog(scope.row.attr_id)">编辑</el-button
                >
                <el-button type="danger" icon="el-icon-delete" size="mini"
                  @click="removeParams(scope.row.attr_id)">删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                @close="handleClose(i,scope.row)" >{{item}}</el-tag>
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

             </template>
                </el-table-column>
                <!-- 索引列 -->
                  <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column
                    label="参数名称"
                    prop="attr_name"
                    ></el-table-column>
                     <el-table-column label="操作">
                      <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                        @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                        @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数对话框 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加参数对话框 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      cateList: [],
      //级联选择框的配置对象
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //级联选择框双向绑定到的数组
      selectedKeys: [],
      //被激活的页签名称
      activeName: "many",
      //动态参数数据
      manyTableData: [],
      //静态属性的数据
      onlyTableData: [],
      addDialogVisible: false,
      editDialogVisible:false,
      
      addForm:{
        attr_name:''
      },
      editForm:{},
      addFormRules:{
        attr_name:[
          {required:true,message:'请输入参数名称',trigger:'blur'}
        ]
      },
      editFormRules:{
        attr_name:[
          {required:true,message:'请输入参数名称',trigger:'blur'}
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.cateList = res.data;
    },
    //级联选择框选中项变化，触发该函数
    handleChange() {
      this.getParamsDate();
    },
    //获取参数列表数据
    async getParamsDate() {
      //证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyTableData=[]
        this.onlyTableData=[]
        return;
      }
      //证明选中的时三级分类
      //根据所选分类ID，和当前所处的面版，获取对应参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }
     
      res.data.forEach(item=>{
        item.attr_vals=item.attr_vals?item.attr_vals.split(' '):[]
        item.inputVisible=false
        item.inputValue=''
      })
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    //tab页签点击事件处理函数
    handleTabClick() {
      this.getParamsDate();
    },
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    addParams(){
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid)return
        const {data:res}=await this.$http.post(`categories/${this.cateId}/attributes`,{
          attr_name:this.addForm.attr_name,
          attr_sel:this.activeName,
        })
        if (res.meta.status !== 201) {
          return this.$message.error("添加参数失败");
        }
          this.$message.success("添加参数成功");
          this.addDialogVisible=false
          this.getParamsDate()
      })
    },
    async showEditDialog(attrId){
      const {data:res}=await this.$http.get(`categories/
      ${this.cateId}/attributes/${attrId}`,{
        params:{attr_sel:this.activeName}
      })
      if (res.meta.status !== 200) {
          return this.$message.error("获取参数信息失败");
        }
      this.editForm=res.data
      this.editDialogVisible=true
    },
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    editParams(){
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid)return
        const {data:res}=await this.$http.put(`categories/
        ${this.cateId}/attributes/${this.editForm.attr_id}`,
        {
          attr_name:this.editForm.attr_name,
          attr_sel:this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败");
        }
        this.$message.success("修改参数成功")
        this.getParamsDate()
        this.editDialogVisible=false
    })
    },
    async removeParams(attrId){
      const confirmResult=await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
      }).catch(err=>err)
      //如果用户确认删除，则返回字符串为confirm
      //如果用户取消了删除，则返回字符串为cancel
      if(confirmResult !=='confirm'){
        return this.$message.info('已取消删除')
      }

      const {data:res}=await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
       if (res.meta.status !== 200) {
          return this.$message.error("删除参数失败");
        }
       this.$message.success("删除参数成功");
       this.getParamsDate()
    },
    //文本框失去焦点，或按下回车
    async handleInputConfirm(row){
      if(row.inputValue.trim().length===0){
        row.inputValue=''
        row.inputVisible=false
        return
      }
      //
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue=''
      row.inputVisible=false
      //发起请求，完成操作
      this.saveAttrVals(row)
    },
    async saveAttrVals(row){
      const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`
      ,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
          return this.$message.error("修改参数项失败");
        }
      this.$message.success("修改参数项成功");
    },
    showInput(row){
      row.inputVisible=true
      //让文本框自动获得焦点
      //$nextTick方法作用：当页面上元素被重新渲染后，才会指定回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    //删除对应参数可选项
    handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    //如果按钮需要被禁用，则返回true，不需要则返回false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true;
      }
    },
    //当前选中的三级分类ID
    cateId() {
      if (this.selectedKeys.length == 3) {
        return this.selectedKeys[2];
      }
      return null;
    },
    //动态计算标题
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  }
 }
</script>

<style leng="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag{
  margin:10px;
}
.input-new-tag{
  width: 120px;
}
</style>