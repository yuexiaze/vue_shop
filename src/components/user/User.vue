<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit"
                size="mini" @click="showEditDialog(scope.row)">
              </el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete"
                size="mini" @click="removeUserById(scope.row.id)">
              </el-button>
            </el-tooltip>
            <!-- 分配角色 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
       <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
        </el-form-item>
       <el-form-item label="密码" prop="password">
        <el-input v-model="addForm.password"></el-input>
        </el-form-item>
       <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
        </el-form-item>
       <el-form-item label="手机号" prop="mobile">
        <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="edtiDialogVisible" width="50%" @close="edtiDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="edtiDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配角色" width="50%" :visible.sync="setRoleDialogVisible" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
           <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
              </el-option>
           </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="setRoleDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList();
  },
  data() {
    //自定义验证邮箱规则
    var checkEmail = (rule,value,cb)=>{
      const regEmail =/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if(regEmail.test(value)){
      //合法邮箱
      return cb()
      }
      cb(new Error('请输入合法邮箱'))
    }
    //自定义验证手机号规则
    var checkMobile = (rule,value,cb)=>{
      const regMobile=/^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/
      if(regMobile.test(value)){
      //合法手机号
      return cb()
      }
      cb(new Error('请输入合法手机号'))
    }
    return {
      //获取用户列表数据
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userList: [],
      total: 0,
      //控制添加用户对话框的显示与隐藏
      addDialogVisible:false,
      //控制修改用户对话框的显示与隐藏
      edtiDialogVisible:false,
      //添加用户表单数据
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      //添加表单的验证规则对象
      addFormRules:{
        username:[
          {required:true,message:'请输入用户名',trigger:'blur'},
          {min:3,max:10,message:'用户名的长度在3~10字符之间',trigger:'blur'}
          ],
        password:[
          {required:true,message:'请输入密码',trigger:'blur'},
          {min:6,max:15,message:'用户名的长度在6~15字符之间',trigger:'blur'}
          ],
        email:[
          {required:true,message:'请输入邮箱',trigger:'blur'},
          {validator:checkEmail,trigger:'blur'}
          ],
        mobile:[
          {required:true,message:'请输入手机号',trigger:'blur'},
          {validator:checkMobile,trigger:'blur'}
          ],
      },
      //查询到的用户信息对象
      editForm:{},
      editFormRules :{
        email:[
          {required:true,message:'请输入邮箱',trigger:'blur'},
          {validator:checkEmail,trigger:'blur'}
          ],
        mobile:[
          {required:true,message:'请输入手机号',trigger:'blur'},
          {validator:checkMobile,trigger:'blur'}
          ]
      },
      //分配权限对话框的隐藏与显示
      setRoleDialogVisible:false,
      //需要分配权限的用户信息
      userInfo:{},
      //所有角色的数据列表
      rolesList:[],
      //已选中的角色id
      selectedRoleId:''
    };
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听switch状态的改变
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      this.$message.success("更新用户状态成功！");
    },
    //添加用户框取消键事件->清空
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮，添加用户
    addUser(){
       this.$refs.addFormRef.validate(async valid=>{
         if(!valid) return
         //可以发起添加新用户请求
        const {data:res}=await this.$http.post('users',this.addForm)
        if(res.meta.status !==201){
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        //隐藏对话框
        this.addDialogVisible=false
        //重新获取用户列表
        this.getUserList()

       })
    },
    //展示编辑用户的对话框
    async showEditDialog(row){
      const {data:res} =await this.$http.get('users/'+row.id)
      if(res.meta.status !==200){
        return this.$message.error('查询用户失败')
      }
      this.editForm=res.data
      this.edtiDialogVisible=true
    },
    //修改用户框取消键事件->清空
    edtiDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{   
        if(!valid) return

       const {data:res}=await this.$http.put('users/' + this.editForm.id,{
          email:this.editForm.email,
          mobile:this.editForm.mobile
        })
      if(res.meta.status !==200){
        return this.$message.error('更新用户信息失败')
      }

      this.edtiDialogVisible=false
      this.getUserList()
      this.$message.success('更新用户信息成功')
      })
    },
    //删除用户确定按钮
    async removeUserById(id){
     const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      //如果用户确认删除，则返回字符串为confirm
    //如果用户取消了删除，则返回字符串为cancel
    if(confirmResult !=='confirm'){
      return this.$message.info('已取消删除')
    }

    const {data:res}=await this.$http.delete('users/' + id)
    if(res.meta.status !==200){
      return this.$message.error('删除用户失败')
    }
    this.$message.success('删除用户成功')
    this.getUserList()
    },
    async setRole(userInfo){
      this.setRoleDialogVisible=true
      //在展示对话框前获取所有角色列表
      const {data:res}=await this.$http.get('roles')
      if(res.meta.status !==200){
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList=res.data
      this.userInfo=userInfo
    },
    //保存角色选择
    async saveRoleInfo(){
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色')
      }

     const {data:res}=await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
     if(res.meta.status !==200){
       return this.$message.error('更新角色失败')
     }
     this.$message.success('更新角色成功')
     this.getUserList()
     this.setRoleDialogVisible=false
    },
    setRoleDialogClosed(){
      this.selectedRoleId=''
      this.userInfo=''
    }
  }
};
</script>

<style lang="less" scoped>
</style>