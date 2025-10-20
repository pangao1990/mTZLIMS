import api from '@/api/request/index'

// 登录
export const apiGetHome = (params, config = {}) => {
	return api.request({
		url: '/weixin/get_home',
		method: 'POST',
		data: params,
		...config,
	})
}