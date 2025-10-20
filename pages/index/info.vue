<template>
	<tn-notify ref="refNotify" />
	<tn-modal ref="refModal" />
	<div class="bg">
		<!-- 顶部导航栏 -->
		<div class="nav">
			<div class="nav-side">
				<tn-icon :name="state.isBack2Home ? 'home' : 'left'" bold size="22px" custom-class="nav-back" @click="onBack" />
			</div>
			<span class="nav-title">检测项目</span>
			<div class="nav-side">
				<tn-icon name="my" bold size="22px" custom-class="nav-btn" @click="onLogin" />
			</div>
		</div>

		<div class="content-container">
			<!-- 产品基本信息卡片 -->
			<view class="card product-basic">
				<view class="product-name">{{state.info.name}}</view>
				<view class="product-category">
					<text v-if="state.info.sort1!= ''" class="category-tag primary">{{state.info.sort1}}</text>
					<text v-if="state.info.sort2!= ''" class="category-tag primary">{{state.info.sort2}}</text>
				</view>
			</view>

			<!-- 检测内容卡片 -->
			<view v-if="state.info.testing_content!=''" class="card product-details">
				<view class="card-title">
					<view class="title-circle"></view>
					<text>检测内容</text>
				</view>
				<view class="detail-content">{{state.info.testing_content}}</view>
			</view>

			<!-- 临床意义卡片 -->
			<view v-if="state.info.clinical_significance!=''" class="card product-clinical">
				<view class="card-title">
					<view class="title-circle"></view>
					<text>临床意义</text>
				</view>
				<view class="clinical-content">{{state.info.clinical_significance}}</view>
			</view>

			<!-- 产品规格卡片 -->
			<view v-if="state.info.submission_requirements!='' || state.info.report_time!='' || state.info.storage_requirements!='' || state.info.transportation_requirements!=''"
				class="card product-specs">
				<view class="card-title">
					<view class="title-circle"></view>
					<text>样本要求</text>
				</view>
				<view v-if="state.info.submission_requirements!=''" class="spec-item">
					<tn-icon name="star" size="18px" color="#244851"></tn-icon>
					<text>送检要求: {{state.info.submission_requirements}}</text>
				</view>
				<view v-if="state.info.report_time!=''" class="spec-item">
					<tn-icon name="clock" size="18px" color="#244851"></tn-icon>
					<text>报告时间: {{state.info.report_time}}</text>
				</view>
				<view v-if="state.info.storage_requirements!=''" class="spec-item">
					<tn-icon name="bookmark" size="18px" color="#244851"></tn-icon>
					<text>保存要求: {{state.info.storage_requirements}}</text>
				</view>
				<view v-if="state.info.transportation_requirements!=''" class="spec-item">
					<tn-icon name="logistics" size="18px" color="#244851"></tn-icon>
					<text>运输要求: {{state.info.transportation_requirements}}</text>
				</view>
			</view>

			<!-- 报告单模板 -->
			<view v-if="state.info.report_template_url!=''" class="card product-clinical">
				<view class="card-title">
					<view class="title-circle"></view>
					<text>报告单模板</text>
				</view>
				<view class="clinical-content card-report">
					<view class="btn" @click="onDownload(state.info.report_template_url)">预览</view>
					<view class="btn ml16" @click="onDownload(state.info.report_template_url, 'download')">下载</view>
				</view>
			</view>

		</div>
	</div>

	<!-- 登录 -->
	<Login :is_mask_click="true" />
</template>

<script setup>
	import Login from '/pages/login/index.vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		getCurrentInstance,
		ref,
		reactive,
		onMounted,
		watch
	} from 'vue'
	import {
		Local,
		StorageKey
	} from '@/utils/storage'
	import {
		apiProductGetInfo
	} from '@/api/weixin'
	import {
		useStoreUserInfo
	} from '@/stores/userInfo'

	const storeUserInfo = useStoreUserInfo()

	const refNotify = ref()
	const refModal = ref()
	const state = reactive({
		id: '',
		info: [],
		isBack2Home: false
	})

	onLoad((option) => {
		if (option.id != undefined) state.id = option.id
		if (state.id == '') uni.navigateTo({
			url: '/pages/index/index'
		})
	})

	onMounted(() => {
		getInfo()

		const pages = getCurrentPages()
		state.isBack2Home = pages.length == 1
	})

	// 返回上一页
	const onBack = () => {
		if (state.isBack2Home) uni.redirectTo({
			url: '/pages/index/index'
		})
		else uni.navigateBack()
	}

	// 跳转到详情页
	const onDownload = (url, type = '') => {
		if (type == 'download') window.open(url)
		// 查看pdf
		else uni.navigateTo({
			url: `/pages/sample/pdf?url=${url}`
		})
	}

	const getInfo = () => {
		const token = storeUserInfo.token
		const para = {
			'id': state.id,
			'token': token
		}
		// console.log('para', para)
		apiProductGetInfo(para)
			.then((res) => {
				// console.log('res', res)
				state.info = res.info
				const userId = res.userId
				if (userId == '') {
					if (token != '') {
						// 重新登录
						storeUserInfo.setIsShowLogin(true)
					}
					storeUserInfo.setToken('')
					storeUserInfo.clearUserInfos()
				}
			})
	}

	// 跳转登录
	const onLogin = () => {
		const token = storeUserInfo.token
		if (token == '') storeUserInfo.setIsShowLogin(true)
		else {
			refModal.value?.showModal({
				title: '',
				content: '是否退出登录？',
				showCancel: true,
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

	watch(
		() => storeUserInfo.isReLoad,
		(isReLoad) => {
			if (isReLoad) {
				getInfo()
				storeUserInfo.setIsReLoad(false)
			}
		})
</script>

<style scoped lang="scss">
	.bg {
		min-height: 100vh;
		background: linear-gradient(180deg, #F8F9FF 0%, #FFFFFF 100%);
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

	/* 内容容器 */
	.content-container {
		padding: 30rpx;
		padding-top: 40rpx;
	}

	/* 卡片通用样式 */
	.card {
		background-color: #fff;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 30rpx rgba(58, 123, 255, 0.08);
		margin-bottom: 32rpx;
		overflow: hidden;
		transition: all 0.3s ease;
		padding: 0;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 15rpx rgba(58, 123, 255, 0.1);
		}
	}

	.card-title {
		display: flex;
		align-items: center;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		padding: 28rpx 30rpx 20rpx 0rpx;
		border-bottom: 1px solid #f5f5f5;
		margin-bottom: 20rpx;

		.title-circle {
			width: 12rpx;
			height: 12rpx;
			background: #244851;
			border-radius: 50%;
			margin-right: 16rpx;
		}
	}

	/* 产品基本信息卡片 */
	.product-basic {
		padding: 30rpx;
		position: relative;
		background: linear-gradient(135deg, rgba(58, 123, 255, 0.03) 0%, rgba(90, 154, 255, 0.08) 50%, rgba(255, 255, 255, 0.1) 100%);
		border: 1px solid rgba(58, 123, 255, 0.08);

		.card-header {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			margin-bottom: 20rpx;
		}

		.product-id {
			margin-right: auto;
			font-size: 24rpx;
			color: #666;
			background: rgba(255, 255, 255, 0.8);
			padding: 6rpx 16rpx;
			border-radius: 20rpx;
		}

		.product-price {
			font-size: 36rpx;
			font-weight: bold;
			color: #FF5A5F;
		}

		.product-name {
			font-size: 36rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 24rpx;
			line-height: 1.4;
			overflow-wrap: break-word; // 允许单词在行尾被截断
			word-break: break-all; // 允许单词在任意位置被截断
		}

		.product-category {
			display: flex;
			gap: 16rpx;

			.category-tag {
				font-size: 24rpx;
				background: rgba(58, 123, 255, 0.1);
				padding: 8rpx 20rpx;
				border-radius: 20rpx;

				&.primary {
					color: #244851;
					background: rgba(58, 123, 255, 0.1);
				}

				&.secondary {
					color: #FF7D00;
					background: rgba(255, 125, 0, 0.1);
				}
			}
		}
	}

	/* 产品规格卡片 */
	.product-specs {
		padding: 0 30rpx 30rpx;

		.spec-item {
			display: flex;
			align-items: center;
			padding: 20rpx 0;
			font-size: 28rpx;
			color: #555;
			overflow-wrap: break-word; // 允许单词在行尾被截断
			word-break: break-all; // 允许单词在任意位置被截断

			text {
				margin-left: 16rpx;
			}

			.tn-icon {
				flex-shrink: 0;
			}
		}
	}

	/* 检测内容卡片 */
	.product-details {
		padding: 0 30rpx 30rpx;

		.detail-content {
			font-size: 28rpx;
			color: #555;
			line-height: 1.6;
			text-align: justify;
			overflow-wrap: break-word; // 允许单词在行尾被截断
			word-break: break-all; // 允许单词在任意位置被截断
		}
	}

	/* 临床意义卡片 */
	.product-clinical {
		padding: 0 30rpx 30rpx;

		.clinical-content {
			font-size: 28rpx;
			color: #555;
			line-height: 1.6;
			text-align: justify;
			overflow-wrap: break-word; // 允许单词在行尾被截断
			word-break: break-all; // 允许单词在任意位置被截断
		}
	}

	.card-report {
		display: flex;

		.btn {
			color: #333;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			text-decoration: underline;
			color: #244851;
		}
	}

	.ml16 {
		margin-left: 16px;
	}
</style>