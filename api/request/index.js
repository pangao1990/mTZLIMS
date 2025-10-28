import {
	Local,
	StorageKey
} from '@/utils/storage'
import {
	useStoreUserInfo
} from '@/stores/userInfo'

const storeUserInfo = useStoreUserInfo()

// 注意 ！！！ add.vue 的 urlRoot 参数也要修改
const rootUrl = 'http://lims.akrivamed.com:5555/api' // http://127.0.0.1:8879/api    http://lims.akrivamed.com:5555/api    http://58.215.216.131:5555/api

// request.js
export default {
	config: {
		baseURL: rootUrl,
		beforeRequest(options = {}) {
			return new Promise((resolve) => {
				options.url = this.baseURL + options.url;
				options.header = {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + storeUserInfo.token,
				}
				resolve(options)
			})
		},
		handleResponse(response) {
			let res = response.data
			// console.log('res', res)
			if (res.status === 401) {
				// token过期
				storeUserInfo.setToken('')

				// 弹出登录页面
				storeUserInfo.setIsShowLogin(true)

				return Promise.reject(res)
			} else if (res.status === 400) {
				uni.showToast({
					title: '权限不足',
					icon: 'error'
				})
				uni.redirectTo({
					url: '/pages/index/index'
				})
				return Promise.reject(res)
			} else if (res.status !== 200) {
				return Promise.reject(res)
			} else {
				return res
			}
		},
	},
	request(options = {}) {
		return this.config.beforeRequest(options)
			.then(opt => uni.request(opt))
			.then(res => this.config.handleResponse(res))
	},
}