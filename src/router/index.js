import Vue from 'vue'
import Router from 'vue-router'
const Login=()=>import('../components/login.vue')
const Home=()=>import('../components/Home.vue')
const Welcome=()=>import('../components/Welcome.vue')
const User=()=>import('../components/user/User.vue')
const Rights=()=>import('../components/power/Rights.vue')
const Roles=()=>import('../components/power/Roles.vue')
const Cate=()=>import('../components/goods/Cate.vue')
const Params=()=>import('../components/goods/Params.vue')
const GoodsList=()=>import('../components/goods/List.vue')
const AddGoods=()=>import('../components/goods/Add.vue')
const Order=()=>import('../components/order/order.vue')
const Report=()=>import('../components/report/Report.vue')
// import Home from '../components/Home.vue'
// import Welcome  from '../components/Welcome.vue'
// import User from '../components/user/User.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Cate from '../components/goods/Cate.vue'

Vue.use(Router)

const routes = [
  { path:'/', redirect:'/login'},
  { path:'/login', component:Login},
  { 
    path:'/home',
    component:Home,
    redirect:'/welcome',
    children:[{
    path:'/welcome',
    component:Welcome
  },{
    path:'/users',
    component:User
  },{
    path:'/rights',
    component:Rights
  },{
    path:'/roles',
    component:Roles
  },{
    path:'/categories',
    component:Cate
  },{
    path:'/params',
    component:Params
  },{
    path:'/goods',
    component:GoodsList
  },{
    path:'/goods/add',
    component:AddGoods
  },{
    path:'/orders',
    component:Order
  },{
    path:'/reports',
    component:Report
  }]
  }
]

const router = new Router({
  routes
})


router.beforeEach((to, from, next) => {
  // to and from are both route objects. must call `next`.
  // to 将要访问的路径
  // from 代表从哪个路径跳转来
  // next是一个函数，表示放行
  // next() 放行   next('/login')强制跳转
  if(to.path === '/login') return next()
  //获取token
  const tokenStr= window.sessionStorage.getItem("token")
  if(!tokenStr) return next('/login')
  next()

})
export default router
