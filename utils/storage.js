// 防止部署多套系统到同一域名不同目录时，变量共用的问题。__KOALA_NAME__ 为 package.json 中的 name
const getKey = (key) => {
	// eslint-disable-next-line no-undef
	const TAG = 'mTZLIMS'
	if (key == 'token') return `${TAG}_token`
	return `${TAG}:${key}`
}

/**
 * 存储关键词
 */
export const StorageKey = {
	Token: getKey('token'), // 令牌
	AutoLogin: getKey('autoLogin'), // 自动登录
	UserInfo: getKey('userinfo'), // 用户信息
}

/**
 * 浏览器永久缓存
 * @method set 设置永久缓存
 * @method get 获取永久缓存
 * @method remove 移除永久缓存
 * @method clear 移除全部永久缓存
 */
export const Local = {
	// 设置永久缓存
	set(key, val) {
		uni.setStorageSync(key, val)
	},
	// 获取永久缓存
	get(key) {
		return uni.getStorageSync(key)
	},
	// 移除永久缓存
	remove(key) {
		uni.removeStorageSync(key)
	},
	// 移除全部永久缓存
	clear() {
		uni.clearStorageSync()
	}
}