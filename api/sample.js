import api from '@/api/request/index'

// 获取列表 - 样本类型
export const apiSampleTypeGetList = (params, config = {}) => {
	return api.request({
		url: '/config/sampletype/get_list',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取列表 - 标本性状
export const apiSampleCharacterGetList = (params, config = {}) => {
	return api.request({
		url: '/config/samplecharacter/get_list',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取列表 - 销售端
export const apiClientGetList = (params, config = {}) => {
	return api.request({
		url: '/config/client/get_list',
		method: 'POST',
		data: params,
		...config,
	})
}

// 新增样本信息
export const apiApplicationInfoAdd = (params, config = {}) => {
	return api.request({
		url: '/sample/add',
		method: 'POST',
		data: params,
		...config,
	})
}

// 编辑样本信息
export const apiApplicationInfoEdit = (params, config = {}) => {
	return api.request({
		url: '/sample/edit',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取样本详细信息 - API
export const apiApplicationInfoGetInfoForAPI = (params, config = {}) => {
	return api.request({
		url: '/sample/get_info_for_api',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取样本详细信息
export const apiApplicationInfoGetInfo = (params, config = {}) => {
	return api.request({
		url: '/sample/get_info',
		method: 'POST',
		data: params,
		...config,
	})
}

// 删除样本信息
export const apiApplicationInfoDelete = (params, config = {}) => {
	return api.request({
		url: '/sample/delete',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取样本列表
export const apiApplicationGetList = (params, config = {}) => {
	return api.request({
		url: '/sample/get_list',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取报告列表
export const apiReportGetList = (params, config = {}) => {
	return api.request({
		url: '/report/get_list',
		method: 'POST',
		data: params,
		...config,
	})
}

// 下载报告
export const apiReportDownload = (params, config = {}) => {
	return api.request({
		url: '/report/download',
		method: 'POST',
		data: params,
		...config,
	})
}

// 批量下载报告
export const apiReportDownloads = (params, config = {}) => {
	return api.request({
		url: '/report/downloads',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取送检单位列表
export const apiHospitalGetList = (params, config = {}) => {
	return api.request({
		url: '/config/hospital/get_list',
		method: 'POST',
		data: params,
		...config,
	})
}

// 获取检测单项列表
export const apiProductGetList = (params, config = {}) => {
	return api.request({
		url: '/config/product/get_list',
		method: 'POST',
		data: params,
		...config,
	})
}

// 新增匹配API
export const apiConfigMatchAPIAdd = (params, config = {}) => {
	return api.request({
		url: '/config/match_api/add',
		method: 'POST',
		data: params,
		...config,
	})
}

// 客户配置
export const apiConfigClientGetList = (params, config = {}) => {
	return api.request({
		url: '/config/client/get_list',
		method: 'POST',
		data: params,
		...config,
	})
}

// 业务经理API
export const apiConfigManagerGetList = (params, config = {}) => {
	return api.request({
		url: '/config/manager/get_list',
		method: 'POST',
		data: params,
		...config,
	})
}