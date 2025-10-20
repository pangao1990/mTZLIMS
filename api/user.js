import api from '@/api/request/index'

// 登录
export const apiUserLogin = (params, config = {}) => {
	return api.request({
		url: '/user/login',
		method: 'POST',
		data: params,
		...config,
	})
}

// 邮箱验证码
export const apiUserGetCodeForEmail = (params, config = {}) => {
	return api.request({
		url: '/user/get_code_for_email',
		method: 'POST',
		data: params,
		...config,
	})
}

// 重置密码
export const apiUserReset = (params, config = {}) => {
	return api.request({
		url: '/user/reset_password',
		method: 'POST',
		data: params,
		...config,
	})
}