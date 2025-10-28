<template>
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

	<view class="container">

		<view class="content">
			<!-- 卡片1 - 搜索框 -->
			<view class="card search-card tn-shadow-blur">
				<view class="search-container">
					<tn-search-box v-model="state.search" @focus="gotoSearchSort1('')" @search="gotoSearchSort1('')" placeholder="请输入检测项目（下单、查询）"
						input-style="background-color: #f5f7fa; border-radius: 20px" search-button-bg-color="#3A7BFF" :search-button="false" />
					<view class="login" @click="onLogin">
						<tn-icon :name="storeUserInfo.token == '' ? 'my': 'my-love'" bold size="22px" />
					</view>
				</view>
			</view>

			<!-- 卡片2 - 服务项目 -->
			<view class="card services-card tn-shadow-blur">
				<view class="section-title">
					<text class="title-text">项目查询</text>
				</view>

				<view class="services-grid">
					<view class="service-item" v-for="(item, index) in state.homes" :key="index" @click="gotoSearchSort1(item.sort1)">
						<view class="service-card" :class="{ 'with-bg-image': item.imgUrl }" :style="item.imgUrl ? { backgroundImage: `url(${item.imgUrl})` } : {}">
							<template v-if="!item.imgUrl">
								<view class="service-icon-bg" :class="`color-${index % 8}`">
									<text class="service-abbr">{{ item.sort1_abbr }}</text>
								</view>
								<view class="service-content">
									<text class="service-name">{{ item.sort1 }}</text>
									<text class="service-desc">{{ item.description.length > 5 ? item.description.slice(0, 5) + '...' : item.description }}</text>
								</view>
								<view class="service-arrow">
									<tn-icon name="right" size="24rpx" color="#999" />
								</view>
							</template>

							<template v-else>
								<view class="service-image-overlay">
									<text class="service-name-overlay">{{ item.sort1 }}</text>
								</view>
							</template>
						</view>
					</view>
				</view>
			</view>

			<!-- 卡片3 - 公司简介 & 操作按钮 -->
			<view class="card action-card tn-shadow-blur">
				<view class="button-group">
					<view v-if="storeUserInfo.isApplication" class="dual-btns">
						<button class="action-btn primary" @click="gotoSampleAdd">项目下单</button>
						<button class="action-btn primary" @click="gotoReportList">报告下载</button>
					</view>
					<view v-if="storeUserInfo.isApplication" class="divider-vertical"></view>
					<button class="action-btn outline" @click="state.showPopup2=true">公司简介</button>
				</view>
			</view>

			<!-- Banner 最底部 -->
			<view class="card banner-card tn-shadow-blur">
				<div class="banner-container">
					<img class="banner-image" src="/static/index/bar.png" />
					<div class="banner-overlay">
						<div class="banner-title">领航神经疾病检验创新</div>
						<div class="banner-subtitle">筑就神经系统健康坚固防线</div>
					</div>
				</div>
			</view>
		</view>
	</view>

	<!-- 公司简介弹窗 -->
	<tn-popup v-model="state.showPopup2" close-btn mode="bottom" height="70%">
		<view class="popup-content">
			<view class="popup-title">公司简介</view>
			<scroll-view scroll-y class="popup-scroll" :style="{ height: scrollHeight + 'px' }">
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
		// console.log('gotoSearchSort1', sort1)
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
			storeUserInfo.setIsReLoad(false)
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
		min-height: 100vh;
		background: linear-gradient(to bottom, #f7faff, #eef3f9);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 0rpx;
		position: relative;

		/* 顶部柔光阴影，制造视觉层次 */
		&::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 80rpx;
			background: linear-gradient(to bottom, rgba(0, 0, 0, 0.08), transparent);
			z-index: 1;
			pointer-events: none;
		}
	}

	.content {
		width: 92%;
		padding: 40rpx 0 120rpx;
		display: flex;
		flex-direction: column;
		gap: 36rpx;
	}

	/* ========= 通用卡片 Apple风格浮层感 ========= */
	.card {
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(12rpx);
		border-radius: 24rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.7);
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;

		&:hover {
			transform: translateY(-4rpx);
			box-shadow: 0 8rpx 26rpx rgba(0, 0, 0, 0.08);
		}
	}

	/* ========= 搜索卡片 ========= */
	.search-card {
		padding: 30rpx;

		.search-container {
			display: flex;
			align-items: center;
			gap: 20rpx;
			position: relative;
			z-index: 2;
			pointer-events: auto;

			.tn-search-box {
				flex: 1;

				input {
					background-color: #f9fafc !important;
				}
			}

			.login {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				background: #244851;
				color: #ffffff !important;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow:
					inset 0 0 6rpx rgba(255, 255, 255, 0.25),
					0 4rpx 12rpx rgba(36, 72, 81, 0.4);
				transition: all 0.3s ease;

				&:active {
					transform: scale(0.9);
					background: #1a3640;
				}
			}
		}
	}

	/* ========= 服务项目卡片 ========= */
	.services-card {
		padding: 30rpx;

		.section-title {
			margin-bottom: 20rpx;

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
					background: linear-gradient(135deg, #244851, #3a7bff);
					border-radius: 3rpx;
				}
			}
		}

		.services-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 24rpx;

			.service-item {
				position: relative;
				z-index: 2;
				pointer-events: auto;
				width: 100%;

				.service-card {
					display: flex;
					align-items: center;
					padding: 24rpx;
					background: linear-gradient(135deg, #f8faff, #ffffff);
					border-radius: 18rpx;
					border: 1px solid #eef3ff;
					box-shadow: 0 4rpx 10rpx rgba(58, 123, 255, 0.06);
					transition: all 0.3s ease;

					&:hover {
						transform: translateY(-3rpx);
						box-shadow: 0 6rpx 14rpx rgba(58, 123, 255, 0.12);
					}

					.service-icon-bg {
						width: 50rpx;
						height: 50rpx;
						border-radius: 16rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 20rpx;
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
							font-size: 24rpx;
							font-weight: bold;
							color: white;
						}
					}

					.service-content {
						flex: 1;
						display: flex;
						flex-direction: column;

						.service-name {
							font-size: 28rpx;
							font-weight: bold;
							color: #333;
							margin-bottom: 6rpx;
						}

						.service-desc {
							font-size: 22rpx;
							color: #999;
						}
					}

					.service-arrow {
						width: 40rpx;
						height: 40rpx;
						border-radius: 50%;
						background: #f8f9ff;
						display: flex;
						align-items: center;
						justify-content: center;
					}
				}

				.service-card.with-bg-image {
					position: relative;
					background-size: cover;
					background-position: center;
					border-radius: 18rpx;
					height: 180rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
					transition: all 0.3s ease;

					&:hover {
						transform: translateY(-3rpx);
						box-shadow: 0 6rpx 14rpx rgba(0, 0, 0, 0.15);
					}

					.service-image-overlay {
						width: 100%;
						height: 50%;
						background: rgba(0, 0, 0, 0.5); // 半透明黑遮罩增加文字可读性
						border-radius: 18rpx;
						display: flex;
						align-items: center;
						justify-content: center;

						.service-name-overlay {
							font-size: 34rpx;
							font-weight: bold;
							color: #fff;
							text-align: center;
							padding: 0 20rpx;
						}
					}
				}
			}
		}
	}

	/* ========= 操作按钮卡片 ========= */
	.action-card {
		padding: 30rpx 30rpx 40rpx;

		.button-group {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 28rpx;

			.dual-btns {
				display: flex;
				width: 100%;
				gap: 20rpx;
			}

			.action-btn {
				flex: 1;
				height: 80rpx;
				border-radius: 40rpx;
				font-size: 28rpx;
				font-weight: 500;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;

				&.primary {
					background: #244851;
					color: white;
					box-shadow: 0 6rpx 12rpx rgba(36, 72, 81, 0.3);

					&:hover {
						filter: brightness(1.1);
					}
				}

				&.outline {
					border: 1px solid #244851;
					color: #244851;
					background: white;
					width: 100%;

					&:hover {
						background: #f7f9fb;
					}
				}
			}

			.divider-vertical {
				width: 80%;
				height: 1px;
				background-color: #eaeef5;
			}
		}
	}

	/* ========= Banner 区域 + 渐变衔接带 ========= */
	.banner-card {
		position: relative;
		padding: 0;
		overflow: visible;
		/* 让渐变带能超出边界 */

		.banner-container {
			position: relative;
			width: 100%;
			border-radius: 20rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

			.banner-image {
				width: 100%;
				height: auto;
				display: block;
				transition: transform 0.6s ease;
			}

			&:hover .banner-image {
				transform: scale(1.03);
			}

			.banner-overlay {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: flex-start;
				padding: 40rpx;
				background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.35));
				color: white;

				.banner-title {
					font-size: 34rpx;
					font-weight: bold;
					text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
				}

				.banner-subtitle {
					margin-top: 16rpx;
					font-size: 26rpx;
					font-weight: 400;
					text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
				}
			}
		}

		/* 渐变衔接带 */
		&::after {
			content: '';
			position: absolute;
			top: -20rpx;
			left: 0;
			width: 100%;
			height: 40rpx;
			background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
			z-index: 0;
			border-radius: 20rpx;
		}
	}

	/* ========= 弹窗 ========= */
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