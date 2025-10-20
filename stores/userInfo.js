import {
	defineStore
} from 'pinia'
import {
	ref,
	computed
} from 'vue'
import {
	Local,
	StorageKey
} from '@/utils/storage'

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useStoreUserInfo = defineStore('userInfo', () => {

	// token
	const initialToken = Local.get(StorageKey.Token)
	const token = ref(initialToken)

	function setToken(val) {
		token.value = val
		Local.set(StorageKey.Token, val)
	}

	// 是否展示登录页面
	const isShowLogin = ref(false)

	function setIsShowLogin(val) {
		isShowLogin.value = val
	}

	// 是否刷新页面
	const isReLoad = ref(false)

	function setIsReLoad(val) {
		isReLoad.value = val
	}

	// 已选项目
	const selectedProductIds = ref([])

	function addSelectedProductIds(val) {
		selectedProductIds.value.push(val)
	}

	function setSelectedProductIds(val) {
		selectedProductIds.value = val
	}

	// 缓存全部项目
	const productInfoList = ref([])

	function setProductInfoList(val) {
		productInfoList.value = val
	}

	// 缓存检测单项
	const productBaseList = ref([])

	function setProductBaseList(val) {
		productBaseList.value = val
	}

	// 缓存样本类型
	const sampleTypeList = ref([])

	function setSampleTypeList(val) {
		sampleTypeList.value = val
	}

	// 缓存标本性状
	const sampleCharacterList = ref([])

	function setSampleCharacterList(val) {
		sampleCharacterList.value = val
	}

	// 缓存销售端
	const clientList = ref([])

	function setClientList(val) {
		clientList.value = val
	}

	// 缓存送检单位
	const hospitalList = ref([])

	function setHospitalList(val) {
		hospitalList.value = val
	}

	const userInfos = ref({
		id: '',
		role: ''
	})

	function setUserInfos(info = null) {
		if (info) {
			for (let key in info) {
				if (userInfos.value[key] != undefined) userInfos.value[key] = info[key]
			}
			Local.set(StorageKey.UserInfo, userInfos.value)
		} else {
			const userInfo = Local.get(StorageKey.UserInfo)
			if (userInfo) {
				for (let key in userInfo) {
					userInfos.value[key] = userInfo[key]
				}
			}
		}
	}

	function clearUserInfos() {
		userInfos.value = {
			id: '',
			role: ''
		}
		setUserInfos(userInfos.value)
	}

	// 是否可以录单
	setUserInfos() // 刷新页面时，自动更新数据
	const isApplication = computed(() => userInfos.value.role != '')

	return {
		userInfos,
		setUserInfos,
		clearUserInfos,
		token,
		setToken,
		isShowLogin,
		setIsShowLogin,
		isReLoad,
		setIsReLoad,
		selectedProductIds,
		addSelectedProductIds,
		setSelectedProductIds,
		productInfoList,
		setProductInfoList,
		productBaseList,
		setProductBaseList,
		sampleTypeList,
		setSampleTypeList,
		sampleCharacterList,
		setSampleCharacterList,
		clientList,
		setClientList,
		hospitalList,
		setHospitalList,
		isApplication
	}
})