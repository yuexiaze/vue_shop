<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
     <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roleList" border stripe >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['bdbottom',i1===0?'bdtop':'','vcenter']">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag  closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级，三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环，嵌套渲染二级权限 -->
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2===0?'':'bdtop','vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)" >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="350px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRolesById(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
       <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
       <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="编辑" :visible.sync="edtiDialogVisible" width="50%">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称"  prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="edtiDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id"
      :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights" >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //角色列表
      roleList:[],
      //控制添加角色对话框的显示与隐藏
      addDialogVisible:false,
      //控制编辑角色对话框的显示与隐藏
      edtiDialogVisible:false,
      //控制分配权限对话框的显示与隐藏
      setRightDialogVisible:false,
      //所有权限的数据
      rightList:[],
      //树形控件的绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },
      //添角色表单数据
      addForm:{
        roleName:'',
        roleDesc:''
      },
      //添加角色验证规则
       addFormRules:{
        roleName:[
          {required:true,message:'请输入角色名',trigger:'blur'},
          {min:1,max:6,message:'用户名的长度在1~6字符之间',trigger:'blur'}
          ],
        roleDesc:[
          {required:true,message:'请输入角色描述',trigger:'blur'},
          {min:1,message:'描述不能为空',trigger:'blur'}
          ]
      },
       //查询到的用户信息对象
      editForm:{},
      //默认选中的节点Id值数组
      defKeys:[],
      //获取打开分配权限的角色id
      roleId:''
    }
  },
  created() {
    //获取所有角色
   
    this.getRolesList()
  },
  methods: {
    async getRolesList(){
      const {data:res}=await this.$http.get('roles')
      if(res.meta.status !==200){
       return this.$message.error('获取角色列表失败！')
     }
     this.roleList=res.data
    },
    //添加角色框取消键事件->清空
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    //添加角色框确定按钮事件
     addRole(){
       this.$refs.addFormRef.validate(async valid=>{
         if(!valid) return
         //可以发起添加新用户请求
        const {data:res}=await this.$http.post('roles',this.addForm)
        if(res.meta.status !==201){
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        //隐藏对话框
        this.addDialogVisible=false
        //重新获取用户列表
        this.getRolesList()
       })
    },
    //展示编辑用户的对话框
    async showEditDialog(id){
      const {data:res} =await this.$http.get('roles/'+id)
      if(res.meta.status !==200){
        return this.$message.error('查询用户失败')
      }
      this.editForm=res.data
      this.edtiDialogVisible=true
    },
    //编辑用户的对话框确定按钮
    editUserInfo(){
       this.$refs.editFormRef.validate(async valid=>{   
        if(!valid) return

       const {data:res}=await this.$http.put('roles/' + this.editForm.roleId,{
          roleName:this.editForm.roleName,
          roleDesc:this.editForm.roleDesc
        })
      if(res.meta.status !==200){
        return this.$message.error('编辑失败')
      }

      this.edtiDialogVisible=false
      this.getRolesList()
      this.$message.success('编辑成功')
      })
    },
     //删除用户确定按钮
    async removeRolesById(id){
     const confirmResult=await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      //如果用户确认删除，则返回字符串为confirm
    //如果用户取消了删除，则返回字符串为cancel
    if(confirmResult !=='confirm'){
      return this.$message.info('已取消删除')
    }

    const {data:res}=await this.$http.delete('roles/' + id)
    if(res.meta.status !==200){
      return this.$message.error('删除用户失败')
    }
    this.$message.success('删除用户成功')
    this.getRolesList()
    },
    //根据ID删除对应权限
    async removeRightById(role,rightId){
      //弹框提示
      const confirmResult=await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      //如果用户确认删除，则返回字符串为confirm
    //如果用户取消了删除，则返回字符串为cancel
    if(confirmResult !=='confirm'){
      return this.$message.info('已取消删除')
    }
     
    const {data:res}=await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
    if(res.meta.status !==200){
      return this.$message.error('删除权限失败')
    }
    this.$message.success('删除权限成功')
    role.children=res.data
    },
    //展示分配权限对话框
    async showSetRightDialog(role){
      this.roleId=role.id
      //获取所有权限的信息
      const {data:res} =await this.$http.get('rights/tree')
      if(res.meta.status !==200){
        return this.$message.error('获取权限数据失败')
      }
      //把获取到的权限数据保存到data中
      this.rightList=res.data
      //获取三级节点id
      this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible=true
    },
    //通过递归的形式，获取角色下所有三级权限的Id，并保存到defKeys中
    getLeafKeys(node,arr){
      //如果当前node不包含children，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item=>this.getLeafKeys(item,arr))
    },
    //监听分配权限对话框关闭事件
    setRightDialogClosed(){
      this.defKeys=[]
    },
    //点击为角色分配权限
    async allotRights(){
      const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr=keys.join(',')
      const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status !==200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible=false
    }
  },
}
</script>

<style scoped lang="less">
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;

}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>