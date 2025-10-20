import App from './App'

// 状态管理 pinia
import pinia from '@/stores'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// 状态管理 pinia
app.use(pinia)
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	// 状态管理 pinia
	app.use(pinia)
	return {
		app
	}
}
// #endif