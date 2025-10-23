<template>
	<tn-notify ref="refNotify" />

	<tn-modal ref="modalRef">
		<template #default>
			<div class="logout-modal">
				<div class="info-item">
					<span class="label">姓名：</span>
					<span class="value">{{ storeUserInfo.userInfos.name }}</span>
				</div>
				<div class="info-item">
					<span class="label">邮箱：</span>
					<span class="value">{{ storeUserInfo.userInfos.email }}</span>
				</div>
				<div class="confirm-text">是否退出登录？</div>
			</div>
		</template>
	</tn-modal>

	<div class="bg">
		<!-- 顶部导航栏 -->
		<div class="nav">
			<div class="nav-side">
				<tn-icon :name="state.isBack2Home ? 'home' : 'left'" bold size="22px" custom-class="nav-back" @click="onBack" />
			</div>
			<span class="nav-title">项目查询</span>
			<div class="nav-side">
				<tn-icon name="my" bold size="22px" custom-class="nav-btn" @click="onLogin" />
			</div>
		</div>

		<!-- 搜索卡片 -->
		<div class="search-container">
			<view class="card card-search">
				<tn-search-box v-model="state.search" placeholder="请输入检测项目" input-style="background-color: #f5f7fa; border-radius: 50px; padding: 0 30rpx;"
					search-button-bg-color="#244851" search-icon-color="#fff" @search="onSearch" @clear="onClear" />

				<div class="tag-container">
					<div v-for="item in state.homes" :key="item.sort1" class="tag-item" :class="{'activate': state.sort1 == item.sort1}" @click="onChangeSort1(item.sort1)">
						{{item.sort1}}
					</div>
				</div>
			</view>
		</div>


		<div class="content-container">

			<div v-if="state.info.length == 0" class="empty-state">
				<div class="empty-state__illustration">
					<img src="/static/index/noData.png" />
				</div>
				<p class="empty-state__title">无数据</p>
			</div>

			<!-- 结果卡片 -->
			<view v-else class="card card-item">
				<tn-collapse v-if="!state.loading" v-model="currentCollapse" accordion>
					<tn-collapse-item v-for="(item, index) in state.info" :key="index" title-style="font-weight: 500; color: #333;" arrow-color="#244851">
						<template #title>
							<view v-html="item.sort2 + `<span style='color: #BABABA;'>（${item.list.length}）</span>`"></view>
						</template>
						<view class="custom-list-container">
							<view class="custom-list-item" v-for="(item2, index2) in item.list" :key="index2" @click="gotoInfo(item2.id)">
								<view class="item-content">
									<view class="item-icon-container">
										<view v-if="storeUserInfo.token == '' || !storeUserInfo.isApplication" class="item-icon-bg"></view>
										<tn-checkbox v-else :model-value="state.selectedItems.some(it => it.id === item2.product_id)"
											@change="(checked) => onCheckboxChange(item2.product_id, item2.name, checked)" custom-class="zdy-checkbox" active-color="#244851"
											class="mr8">
										</tn-checkbox>
									</view>
									<view class="item-text-container">
										<view class="item-name-row">
											<text class="item-name" v-html="searched ? highlightKeyword(item2.name) : item2.name"></text>
											<text class="item-price" v-if="item2.price">¥{{item2.price}}</text>
										</view>
										<text class="item-description" v-if="item2.testing_content"
											v-html="searched ? highlightKeyword(item2.testing_content) : item2.testing_content"></text>
										<text class="item-description mt6" v-if="item2.clinical_significance"
											v-html="searched ? highlightKeyword(item2.clinical_significance) : item2.clinical_significance"></text>
									</view>
									<view class="item-arrow">
										<tn-icon name="right" size="24rpx" color="#C0C4CC"></tn-icon>
									</view>
								</view>
							</view>
						</view>
					</tn-collapse-item>
				</tn-collapse>
			</view>
		</div>
	</div>

	<!-- 底部操作栏 -->
	<view v-if="storeUserInfo.token !== '' && hasSelectedItems" class="bottom-action-bar">
		<view class="selected-items-btn" @click="showSelectedItems">
			已选项目 ({{ selectedItemsCount }})
		</view>
		<view class="next-step-btn" @click="handleNextStep">
			下单
		</view>
	</view>

	<!-- 已选项目弹窗 -->
	<tn-popup v-model="state.showSelectedPopup" mode="bottom" height="60%" width="80%">
		<view class="selected-popup-container">
			<view class="popup-header">
				<view class="popup-title">已选项目 ({{ selectedItemsCount }})</view>
				<tn-icon name="close" @click="state.showSelectedPopup = false"></tn-icon>
			</view>
			<scroll-view class="selected-items-list" scroll-y :style="{height: `calc(60vh - 120rpx)`}">
				<view v-for="(item, index) in state.selectedItems" :key="index" class="selected-item">
					<view class="item-index">{{ index + 1 }}.</view>
					<view class="item-name">{{ item.name }}</view>
					<tn-checkbox :model-value="true" @change="(checked) => onCheckboxChange(item.id, item.name, checked)" active-color="#244851">
					</tn-checkbox>
				</view>
			</scroll-view>
		</view>
	</tn-popup>

	<!-- 登录 -->
	<Login :is_mask_click="true" />
</template>

<script setup>
	import Login from '/pages/login/index.vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		onMounted,
		computed,
		watch
	} from 'vue'
	import {
		apiProductGetListFromSort1
	} from '@/api/weixin'
	import {
		apiGetHome
	} from '@/api/home'
	import {
		useStoreUserInfo
	} from '@/stores/userInfo'
	import {
		Local,
		StorageKey
	} from '@/utils/storage'
	import {
		apiUserLogin
	} from '@/api/user'

	const storeUserInfo = useStoreUserInfo()

	const refNotify = ref()
	const modalRef = ref()
	const currentCollapse = ref()
	const searched = ref(false)
	const state = reactive({
		sort1: '',
		search: '',
		info: [],
		homes: [],
		loading: false,
		isBack2Home: false,
		checkboxIdDict: {},
		selectedItems: [], // 格式: {id: number, name: string}
		showSelectedPopup: false, // 控制已选项目弹窗显示
		selectedItemsCache: {}, // 只缓存已选项目的 {id: name}
	})

	onLoad((option) => {
		if (option.sort1 != undefined) state.sort1 = option.sort1
	})

	const selectedItemsCount = computed(() => state.selectedItems.length)
	const hasSelectedItems = computed(() => selectedItemsCount.value > 0)

	onMounted(() => {
		const pages = getCurrentPages()
		state.isBack2Home = pages.length == 1

		getList()

		autoLogin() // 检测自动登录

		// 获取首页项目分组信息
		postGetHome()
	})

	// 自动登录
	const autoLogin = () => {
		const autoLogin = Local.get(StorageKey.AutoLogin)
		const remember = autoLogin != ''
		// console.log('remember', remember)
		if (remember) {
			// 自动登录
			if (autoLogin == '') {
				// 取消自动登录
				Local.remove(StorageKey.AutoLogin)
			} else {
				// 请求登录
				postLogin(autoLogin.user, autoLogin.password, remember)
			}
		}
	}
	// 请求登录
	const postLogin = (email, password, remember) => {
		const para = {
			user: `${email}`,
			password: password
		}
		// console.log('para', para)
		apiUserLogin(para)
			.then((res) => {
				// console.log('res', res)
				const token = res.token
				if (token === '') {
					// 登录失败

					// 存储 token
					storeUserInfo.setToken('')
					// 存储样本信息
					storeUserInfo.clearUserInfos()

					// 取消自动登录
					Local.remove(StorageKey.AutoLogin)
				} else {
					// 登录成功

					// 存储 token 
					storeUserInfo.setToken(token)
					// 存储样本信息
					storeUserInfo.setUserInfos({
						'id': res.info.id,
						'role': res.info.role
					})

					if (remember) {
						// 自动登录
						Local.set(StorageKey.AutoLogin, para)
					} else {
						// 取消自动登录
						Local.remove(StorageKey.AutoLogin)
					}

					// 刷新页面
					storeUserInfo.setIsReLoad(true)
				}
			})
	}

	const showSelectedItems = () => {
		state.showSelectedPopup = true
	}

	const handleNextStep = () => {
		uni.navigateTo({
			url: '/pages/sample/add'
		})
	}

	// 添加checkbox变化处理方法
	const onCheckboxChange = (id, name, checked) => {
		// console.log(id, name, checked)
		if (checked) {
			// 添加到数组末尾，保持选择顺序
			state.selectedItems.push({
				id,
				name
			})
		} else {
			// 从数组中移除
			const index = state.selectedItems.findIndex(item => item.id === id)
			if (index !== -1) {
				state.selectedItems.splice(index, 1)
			}
		}

		// 更新store中的选择
		storeUserInfo.setSelectedProductIds(state.selectedItems.map(item => item.id))
	}

	// 根据ID获取项目名称
	const getItemNameById = (id) => {
		return state.selectedItemsCache[id] || '未知项目'
	}

	// 返回上一页
	const onBack = () => {
		if (state.isBack2Home) uni.redirectTo({
			url: '/pages/index/index'
		})
		else uni.navigateBack()
	}

	const onChangeSort1 = (sort1) => {
		if (state.sort1 == sort1) state.sort1 = ''
		else state.sort1 = sort1

		// 重置当前展开的面板（关闭所有折叠）
		currentCollapse.value = ''

		// 重置滚动位置
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 0
		})

		getList()
	}

	const onSearch = () => {
		// 重置当前展开的面板（关闭所有折叠）
		currentCollapse.value = ''

		// 重置滚动位置
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 0
		})

		searched.value = true
		getList()
	}

	const onClear = () => {
		// 重置当前展开的面板（关闭所有折叠）
		currentCollapse.value = ''

		// 重置滚动位置
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 0
		})

		searched.value = false
		state.search = ''
		getList()
	}

	const getList = () => {
		state.loading = true
		const para = {
			'sort1': state.sort1,
			'search': state.search,
			'token': storeUserInfo.token
		}
		apiProductGetListFromSort1(para)
			.then((res) => {
				// console.log('res', res)
				state.loading = false
				state.info = res.list
				// 仅有一组数据时，折叠面板默认开启
				if (state.info.length == 1) currentCollapse.value = 0
			}).catch(() => {
				state.loading = false
			})
	}

	const gotoInfo = (id) => {
		uni.navigateTo({
			url: `/pages/index/info?id=${id}`
		})
	}

	const highlightKeyword = (text) => {
		if (!state.search) return text
		const escaped = state.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 防止正则注入
		const reg = new RegExp(`(${escaped})`, 'gi')
		return text.replace(reg, '<span style="color: red;">$1</span>')
	}

	// 跳转登录
	const onLogin = () => {
		const token = storeUserInfo.token
		if (token == '') storeUserInfo.setIsShowLogin(true)
		else {
			modalRef.value?.showModal({
				title: '退出提示',
				content: '是否退出登录？',
				showCancel: true,
				confirmText: '退出登录',
				confirmStyle: {
					color: '#244851',
				},
				cancelStyle: {
					color: '#999',
				},
				cancel: () => {
					// console.log('点击了取消按钮')
				},
				confirm: () => {
					// console.log('点击了确认按钮')
					Local.remove(StorageKey.AutoLogin)
					storeUserInfo.setToken('')
					storeUserInfo.clearUserInfos()

					// 刷新页面
					storeUserInfo.setIsReLoad(true)
				},
			})
		}
	}

	// 初始化时从store加载已选项目
	const initSelectedItems = () => {
		const selectedIds = storeUserInfo.selectedProductIds || []
		const selectedItems = []

		// 遍历所有项目，找到已选的项目并保持store中的顺序
		state.info.forEach(category => {
			category.list.forEach(item => {
				if (selectedIds.includes(item.product_id)) {
					selectedItems.push({
						id: item.product_id,
						name: item.name
					})
				}
			})
		})

		// 保持store中的原始顺序
		state.selectedItems = selectedIds
			.map(id => selectedItems.find(item => item.id === id))
			.filter(Boolean)
	}

	// 获取首页项目分组信息
	const postGetHome = () => {
		const para = {
			size: 100,
			search: {
				usable: true
			}
		}
		// console.log('para', para)
		apiGetHome(para)
			.then((res) => {
				// console.log('res', res)
				state.homes = res.list
			})
	}

	watch(
		() => selectedItemsCount.value,
		(selectedItemsCount) => {
			if (selectedItemsCount == 0) {
				state.showSelectedPopup = false
			}
		})

	watch(
		() => storeUserInfo.selectedProductIds,
		() => initSelectedItems(), {
			deep: true
		}
	)

	watch(
		() => state.info,
		() => initSelectedItems(), {
			deep: true
		}
	)

	watch(
		() => storeUserInfo.isReLoad,
		(isReLoad) => {
			if (isReLoad) {
				getList()
				storeUserInfo.setIsReLoad(false)
			}
		})
</script>

<style scoped lang="scss">
	.bg {
		min-height: 100vh;
		background-color: #F8F9FF;
		padding-bottom: 40rpx;
	}

	/* 导航栏样式 */
	.nav {
		z-index: 10;
		position: sticky;
		top: 0;
		height: 100rpx;
		background: #244851; // linear-gradient(135deg, #3A7BFF 0%, #5A9AFF 100%);
		display: flex;
		align-items: center;
		padding: 0 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(58, 123, 255, 0.2);

		.nav-title {
			color: #fff;
			font-size: 36rpx;
			font-weight: 500;
			letter-spacing: 1rpx;
			text-align: center;
			flex-shrink: 0;
			padding: 0 20rpx;
		}

		.nav-side {
			flex: 1;
			display: flex;
			align-items: center;
		}

		.nav-back {
			color: #fff;
		}

		.nav-btn {
			color: #fff;
			margin-left: auto;
		}
	}

	.search-container {
		padding: 30rpx;
		z-index: 10;
		position: sticky;
		top: 90rpx;
		background-color: #F8F9FF;
	}

	/* 内容容器 */
	.content-container {
		padding: 30rpx;
		padding-top: 0rpx;
	}

	/* 卡片通用样式 */
	.card {
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 30rpx rgba(58, 123, 255, 0.08);
		margin-bottom: 40rpx;
		overflow: hidden;
		transition: all 0.3s ease;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 15rpx rgba(58, 123, 255, 0.1);
		}
	}

	/* 搜索卡片 */
	.card-search {
		padding: 30rpx;
		margin-bottom: 0rpx;
	}

	/* 标签容器 */
	.tag-container {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
		margin-top: 30rpx;
		justify-content: start;

		.tag-item {
			font-size: 12px;
			padding: 4px 6px;
			border-radius: 4px;
			border: 1rpx solid #7D7D7D !important;

			&.activate {
				border: 1rpx solid #244851 !important;
				background-color: #244851;
				color: #fff;
			}
		}
	}

	/* 自定义列表容器 */
	.custom-list-container {
		padding: 0 20rpx 20rpx;

		.custom-list-item {
			padding: 28rpx 0;
			position: relative;

			&:not(:last-child)::after {
				content: "";
				position: absolute;
				left: 80rpx;
				right: 0;
				bottom: 0;
				height: 1rpx;
				background: linear-gradient(90deg, rgba(58, 123, 255, 0.1), rgba(58, 123, 255, 0.01));
			}

			.item-content {
				display: flex;
				align-items: flex-start;
				padding: 0 20rpx;

				.item-icon-container {
					margin-right: 24rpx;
					display: flex;
					align-items: center;
					height: 44rpx;
				}

				.item-icon-bg {
					width: 16rpx;
					height: 16rpx;
					background: #244851; // linear-gradient(135deg, #3A7BFF 0%, #5A9AFF 100%);
					border-radius: 16rpx;
					flex-shrink: 0;
				}

				.item-name {
					flex: 1;
					font-size: 30rpx;
					color: #333;
					font-weight: 400;
					line-height: 1.4;
				}

				.item-arrow {
					display: flex;
					align-items: center;
					margin-left: 20rpx;

					.item-hint {
						font-size: 24rpx;
						color: #999;
						margin-right: 12rpx;
					}
				}

				.item-text-container {
					flex: 1;
					display: flex;
					flex-direction: column;
					margin-right: 20rpx;
				}

				.item-name-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 8rpx;
				}

				.item-name {
					flex: 1;
					font-size: 30rpx;
					color: #333;
					font-weight: 500;
					line-height: 1.4;
				}

				.item-price {
					font-size: 28rpx;
					color: #FF6A6A;
					font-weight: 600;
					margin-left: 20rpx;
					flex-shrink: 0;
				}

				.item-description {
					font-size: 24rpx;
					color: #999;
					line-height: 1.4;
					word-break: break-word;
				}
			}

			&:active {
				opacity: 0.8;
				transform: translateX(4rpx);
				transition: all 0.2s ease;
			}
		}
	}

	/* 折叠面板样式优化 */
	:deep(.tn-collapse-item__content) {
		background-color: #F8F9FF !important;
		padding: 0 !important;
	}

	:deep(.tn-collapse-item__header) {
		padding: 28rpx 32rpx !important;
		border-bottom: 1rpx solid rgba(58, 123, 255, 0.1) !important;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		text-align: center;
		max-width: 400px;
		margin: 0 auto;

		img {
			width: 150px;
		}

		.empty-state__illustration {
			margin-bottom: 24px;
			opacity: 0.6;
		}

		.empty-state__title {
			font-size: 14px;
			color: #888;
			margin-left: -20px;
			margin-bottom: 14px;
		}

		/* 动画效果 */
		.empty-state__illustration img {
			animation: float 3s ease-in-out infinite;
		}
	}

	@keyframes float {

		0%,
		100% {
			transform: translateY(0);
		}

		50% {
			transform: translateY(-10px);
		}
	}

	.mr8 {
		margin-right: 8px;
	}

	/* 底部操作栏样式 */
	.bottom-action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 50rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 100;

		.selected-items-btn {
			color: #244851;
			font-size: 28rpx;
			padding: 10rpx 20rpx;
			border-radius: 50rpx;
			border: 1rpx solid #244851;
		}

		.next-step-btn {
			background: #244851; // linear-gradient(135deg, #3A7BFF 0%, #5A9AFF 100%);
			color: #fff;
			font-size: 28rpx;
			padding: 10rpx 40rpx;
			border-radius: 50rpx;
		}
	}

	/* 已选项目弹窗样式 */
	.selected-popup-container {
		padding: 30rpx;

		.popup-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;

			.popup-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
		}

		.selected-items-list {
			height: calc(60vh - 120rpx); // 确保高度计算正确
			overflow-y: auto;

			.selected-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 24rpx 0;
				border-bottom: 1rpx solid #f5f5f5;

				.item-name {
					flex: 1;
					font-size: 28rpx;
					color: #333;
				}
			}
		}
	}

	.selected-item {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f5f5f5;

		.item-index {
			// width: 36rpx;
			color: #244851;
			font-weight: bold;
			margin-right: 12rpx;
		}

		.item-name {
			flex: 1;
			font-size: 28rpx;
		}
	}

	.mt6 {
		margin-top: 6px;
	}

	// 退出登录
	.logout-modal {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px 28px;
		background-color: #fff;
		border-radius: 16px;
		font-family: 'Segoe UI', 'PingFang SC', sans-serif;
		color: #333;

		.info-item {
			display: flex;
			width: 100%;
			justify-content: space-between;
			align-items: center;
			background: #f9f9f9;
			padding: 10px 14px;
			margin: 6px 0;
			border-radius: 8px;
		}

		.label {
			font-weight: 500;
			color: #666;
		}

		.value {
			font-weight: 600;
			color: #222;
		}

		.confirm-text {
			margin-top: 18px;
			font-size: 16px;
			font-weight: 500;
			color: #444;
		}

		.modal-actions {
			display: flex;
			justify-content: center;
			gap: 16px;
			margin-top: 22px;
			width: 100%;
		}
	}
</style>
<style>
	.zdy-checkbox {
		background-color: #244851;
	}
</style>