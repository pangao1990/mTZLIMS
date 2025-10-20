<template>
	<tn-modal ref="modalRef" />
	<view class="container">
		<!-- 顶部渐变背景 -->
		<view class="header-bg"></view>

		<!-- <view class="divider-bottom">
			<div class="text">Copyright © {{state.year}} 泰臻医学</div>
		</view> -->

		<!-- 主内容区域 -->
		<view class="content">
			<!-- 卡片1 - 搜索和横幅 -->
			<view class="card search-card tn-shadow-blur">
				<view class="search-container">
					<tn-search-box v-model="state.search" @focus="gotoSearchSort1('')" @search="gotoSearchSort1('')" placeholder="请输入检测项目（下单、查询）"
						input-style="background-color: #f5f7fa; border-radius: 20px" search-button-bg-color="#3A7BFF" :search-button="false" />
					<view class="login" @click="onLogin">
						<tn-icon name="my" bold size="22px" />
					</view>
				</view>

				<div class="banner-container">
					<img class="banner-image" src="/static/index/bar.png">
					<div class="banner-overlay">
						<div class="banner-title">领航神经疾病检验创新</div>
						<div class="banner-subtitle">筑就神经系统健康坚固防线</div>
					</div>
				</div>

				<view class="button-group">
					<button class="action-btn outline" @click="state.showPopup2=true">公司简介</button>
				</view>

				<div v-if="storeUserInfo.isApplication">
					<div class="divider-horizontal"></div>
					<view class="button-group">
						<button class="action-btn primary" @click="gotoSampleAdd">项目下单</button>
						<view class="divider-vertical"></view>
						<button class="action-btn primary" @click="gotoReportList">报告下载</button>
					</view>
				</div>

			</view>

			<!-- 卡片2 - 服务项目 -->
			<view class="card services-card tn-shadow-blur">
				<view class="section-title">
					<text class="title-text">项目查询</text>
				</view>

				<view class="services-grid">
					<view class="service-item" v-for="(item, index) in state.homes" :key="index" @click="gotoSearchSort1(item.sort1)">
						<view class="service-card">
							<view class="service-icon-bg" :class="`color-${index % 8}`">
								<text class="service-abbr">{{item.sort1_abbr}}</text>
							</view>
							<view class="service-content">
								<text class="service-name">{{item.sort1}}</text>
								<text class="service-desc">{{item.description}}</text>
							</view>
							<view class="service-arrow">
								<tn-icon name="right" size="24rpx" color="#999" />
							</view>
						</view>
					</view>
				</view>

			</view>
		</view>
	</view>

	<!-- 公司简介 -->
	<tn-popup v-model="state.showPopup2" close-btn mode="bottom" height="70%">
		<view class="popup-content">
			<view class="popup-title">公司简介</view>
			<scroll-view scroll-y class="popup-scroll" :style="{height: scrollHeight + 'px'}">
				<image class="company-logo" src="/static/index/about.png" mode="widthFix"></image>
			</scroll-view>
		</view>
	</tn-popup>

	<!-- 登录 -->
	<Login :is_mask_click="true" />
</template>

<script setup>
	import Login from '/pages/login/index.vue'
	import {
		ref,
		reactive,
		onMounted
	} from 'vue'
	import {
		apiUserLogin
	} from '@/api/user'
	import {
		apiGetHome
	} from '@/api/home'
	import {
		Local,
		StorageKey
	} from '@/utils/storage'
	import {
		useStoreUserInfo
	} from '@/stores/userInfo'

	const storeUserInfo = useStoreUserInfo()

	const modalRef = ref()
	const scrollHeight = ref(0)
	const state = reactive({
		year: (new Date()).getFullYear(),
		search: '',
		homes: [],
		showPopup1: false,
		showPopup2: false
	})

	onMounted(() => {
		// 获取系统信息计算可用高度
		const systemInfo = uni.getSystemInfoSync()
		scrollHeight.value = systemInfo.windowHeight * 0.7 - 100 // 根据实际弹窗高度比例调整

		autoLogin() // 检测自动登录

		// 获取首页项目分组信息
		postGetHome()
	})

	// 跳转到 分类检索 页面
	const gotoSearchSort1 = (sort1) => {
		uni.navigateTo({
			url: `/pages/index/list?sort1=${sort1}`
		})
	}

	const gotoSampleAdd = () => {
		uni.navigateTo({
			url: '/pages/sample/add'
		})
	}
	const gotoReportList = () => {
		uni.navigateTo({
			url: '/pages/sample/report'
		})
	}

	// 自动登录
	const autoLogin = () => {
		const autoLogin = Local.get(StorageKey.AutoLogin)
		const remember = autoLogin != ''
		// console.log('remember', remember, autoLogin)
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

	// 跳转登录
	const onLogin = () => {
		const token = storeUserInfo.token
		if (token == '') storeUserInfo.setIsShowLogin(true)
		else {
			modalRef.value?.showModal({
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
</script>

<style scoped lang="scss">
	.container {
		position: relative;
		min-height: 100vh;
		background-color: #F8F9FF;
	}

	.header-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 440rpx;
		background: #244851;
		z-index: 0;
		border-bottom-left-radius: 30rpx;
		border-bottom-right-radius: 30rpx;
	}

	.content {
		position: relative;
		z-index: 1;
		padding: 20rpx 30rpx;
		padding-top: 40rpx;
	}

	.card {
		z-index: -1;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 10rpx 30rpx rgba(58, 123, 255, 0.12);
		margin-bottom: 30rpx;
		overflow: hidden;
	}

	.search-card {
		padding: 30rpx;

		.search-container {
			display: flex;
			align-items: center;
			gap: 20rpx;

			.tn-search-box {
				flex: 1;
				min-width: 0;
			}

			.login {
				flex-shrink: 0;
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				background: #244851;
				color: white;
				box-shadow: 0 6rpx 12rpx rgba(36, 72, 81, 0.3);
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.banner-container {
			position: relative;
			width: 100%;
			height: auto;
			border-radius: 12px;
			margin: 30px 0;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
			overflow: hidden;
			cursor: pointer;

			&:hover .banner-image {
				transform: scale(1.03);
			}

			.banner-image {
				width: 100%;
				height: auto;
				display: block;
				transition: transform 0.5s ease;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			}

			.banner-overlay {
				position: absolute;
				top: 50%;
				left: 0;
				width: 100%;
				transform: translateY(-50%);
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: flex-start;
				background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3));
				color: white;
				padding: 20px;

				.banner-title {
					font-size: 1.1rem;
					font-weight: bold;
					text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
				}

				.banner-subtitle {
					margin-top: 15px;
					font-size: 0.8rem;
					font-weight: 500;
					text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
				}
			}
		}

		.button-group {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 20rpx;

			.action-btn {
				flex: 1;
				height: 80rpx;
				border-radius: 40rpx;
				font-size: 28rpx;
				font-weight: 500;
				display: flex;
				align-items: center;
				justify-content: center;

				&.primary {
					background: #244851;
					color: white;
					box-shadow: 0 6rpx 12rpx rgba(36, 72, 81, 0.3);
				}

				&.outline {
					border: 1px solid #244851;
					color: #244851;
					background: white;
				}
			}

			.divider-vertical {
				width: 1px;
				height: 40rpx;
				background-color: #eaeef5;
				margin: 0 30rpx;
			}
		}

		.divider-horizontal {
			height: 1px;
			background-color: #eaeef5;
			margin: 30rpx 0;
		}
	}

	.services-card {
		padding: 30rpx;

		.section-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;

			.title-text {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				position: relative;
				padding-left: 20rpx;

				&::before {
					content: '';
					position: absolute;
					left: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 6rpx;
					height: 28rpx;
					background: linear-gradient(135deg, #244851, #3A7BFF);
					border-radius: 3rpx;
				}
			}
		}

		.services-grid {
			display: grid;
			grid-template-columns: 1fr;
			gap: 20rpx;

			.service-item {
				.service-card {
					display: flex;
					align-items: center;
					padding: 30rpx;
					background: linear-gradient(135deg, #f8faff, #ffffff);
					border-radius: 16rpx;
					border: 1px solid #f0f4ff;
					transition: all 0.3s ease;
					box-shadow: 0 4rpx 12rpx rgba(58, 123, 255, 0.08);

					&:active {
						transform: translateY(2rpx);
						box-shadow: 0 2rpx 8rpx rgba(58, 123, 255, 0.12);
						background: linear-gradient(135deg, #f0f4ff, #ffffff);
					}

					.service-icon-bg {
						width: 80rpx;
						height: 80rpx;
						border-radius: 16rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 24rpx;
						flex-shrink: 0;

						&.color-0 {
							background: linear-gradient(135deg, #ff6a30, #ff8f30);
						}

						&.color-1 {
							background: linear-gradient(135deg, #3A7BFF, #5B8DFF);
						}

						&.color-2 {
							background: linear-gradient(135deg, #00C6A2, #00D4B0);
						}

						&.color-3 {
							background: linear-gradient(135deg, #9245FF, #A85AFF);
						}

						&.color-4 {
							background: linear-gradient(135deg, #FF4D8D, #FF6BA3);
						}

						&.color-5 {
							background: linear-gradient(135deg, #00B8D4, #00D4E0);
						}

						&.color-6 {
							background: linear-gradient(135deg, #FFB800, #FFD000);
						}

						&.color-7 {
							background: linear-gradient(135deg, #7B61FF, #8D6EFF);
						}

						.service-abbr {
							font-size: 32rpx;
							font-weight: bold;
							color: white;
						}
					}

					.service-content {
						flex: 1;
						display: flex;
						flex-direction: column;

						.service-name {
							font-size: 30rpx;
							font-weight: bold;
							color: #333;
							margin-bottom: 8rpx;
						}

						.service-desc {
							font-size: 24rpx;
							color: #999;
						}
					}

					.service-arrow {
						width: 48rpx;
						height: 48rpx;
						border-radius: 50%;
						background: #f8f9ff;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-shrink: 0;
					}
				}
			}
		}
	}

	.popup-content {
		width: 92vw;
		height: 100%;
		padding: 30rpx;
		display: flex;
		flex-direction: column;

		.popup-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			text-align: center;
			margin-bottom: 30rpx;
			flex-shrink: 0;

			&::after {
				content: '';
				display: block;
				width: 80rpx;
				height: 6rpx;
				background: #244851;
				border-radius: 3rpx;
				margin: 10rpx auto 0;
			}
		}

		.popup-scroll {
			flex: 1;
			overflow-y: auto;
		}

		.company-logo {
			width: 100%;
			border-radius: 12rpx;
			margin-bottom: 30rpx;
		}

		.section {
			margin-bottom: 30rpx;

			.section-title {
				font-size: 30rpx;
				font-weight: bold;
				color: #3A7BFF;
				margin-bottom: 15rpx;
				padding-left: 15rpx;
				border-left: 6rpx solid #3A7BFF;
			}

			.section-item {
				font-size: 28rpx;
				color: #666;
				line-height: 1.6;
				margin-bottom: 12rpx;
				text-align: justify;
			}

			.note {
				color: #FF6A30;
				background-color: #FFF5F1;
				padding: 12rpx 20rpx;
				border-radius: 8rpx;
				margin-top: 15rpx;
			}
		}
	}

	.divider-bottom {
		width: 80%;
		position: absolute;
		bottom: 20px;
		left: 0;
		right: 0;
		margin-left: auto;
		margin-right: auto;
		color: #BABABA;

		.text {
			display: flex;
			justify-content: center;
		}
	}
</style>