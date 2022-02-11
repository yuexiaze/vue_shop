import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
//导入全局样式
import './assets/css/global.css'

import 'element-ui/lib/theme-chalk/index.css';

import axios from 'axios'

import TreeTable from 'vue-table-with-tree-grid'

import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'
Vue.use(VueQuillEditor)
Vue.component('tree-table',TreeTable)
//在request拦截器中展示进度条
Vue.prototype.$http=axios
//配置请求根路径
axios.defaults.baseURL="http://127.0.0.1:8888/api/private/v1/"
Vue.config.productionTip = false

axios.interceptors.request.use(config=>{
  Nprogress.start()
  config.headers.Authorization=window.sessionStorage.getItem("token")
  return config
})
//在response拦截器中隐藏进度条
axios.interceptors.response.use(config=>{
  Nprogress.done()
  return config
})
Vue.filter('dateFormat',function(originVal){
  const dt=new Date(originVal)
  const y=dt.getFullYear()
  const m=(dt.getMonth()+1+'').padStart(2,'0')
  const d=(dt.getDay()+'').padStart(2,'0')

  const hh=(dt.getHours()+'').padStart(2,'0')
  const mm=(dt.getMinutes()+'').padStart(2,'0')
  const ss=(dt.getSeconds()+'').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App),
  components:{App}
}).$mount('#app')
