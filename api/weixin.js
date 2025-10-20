import api from '@/api/request/index'

// 获取 检测项目列表
export const apiProductGetListFromSort1 = (params, config = {}) => {
	return api.request({
		url: '/weixin/product_get_list_from_sort1',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取 检测项目详情
export const apiProductGetInfo = (params, config = {}) => {
	return api.request({
		url: '/weixin/get_info',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取 检测项目列表
export const apiProductGetList = (params, config = {}) => {
	return api.request({
		url: '/weixin/product_get_list',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取 医院检索列表
export const apiHospitalGetList = (params, config = {}) => {
	return api.request({
		url: '/weixin/get_list_for_hospital',
		method: 'POST',
		data: params,
		...config,
	})
}