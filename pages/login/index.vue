<template>
	<uni-popup ref="refPopup" :is-mask-click="props.is_mask_click" @change="onChangePopup">
		<view class="login-container">
			<!-- 标题 -->
			<view class="login-header">
				<text class="title">欢迎登录</text>
				<text class="subtitle">请登录您的账号</text>
			</view>

			<!-- 选项卡 -->
			<view class="tab-container">
				<view class="tab-item" :class="{active: state.currentTab === 'login'}" @click="state.currentTab = 'login'">
					账号登录
				</view>
				<view class="tab-item" :class="{active: state.currentTab === 'forget'}" @click="state.currentTab = 'forget'">
					忘记密码
				</view>
			</view>

			<!-- 登录表单 -->
			<view class="form-container" v-if="state.currentTab === 'login'">
				<view class="form-item">
					<tn-input v-model="state.loginForm.email" placeholder="请输入邮箱" border clearable></tn-input>
				</view>

				<view class="form-item">
					<tn-input v-model="state.loginForm.password" placeholder="请输入密码" type="password" border clearable></tn-input>
				</view>

				<view class="remember-row">
					<tn-checkbox v-model="state.loginForm.remember" active-color="#244851">记住密码</tn-checkbox>
					<text class="forget-link" @click="state.currentTab = 'forget'">忘记密码?</text>
				</view>

				<tn-button shape="round" bg-color="#244851" text-color="#fff" width="100%" height="90rpx" @click="handleLogin">登 录</tn-button>

				<!-- <view class="other-login">
					<text class="divider">其他登录方式</text>
					<view class="login-icons">
						<tn-icon name="wechat-fill" color="#09BB07" size="50rpx"></tn-icon>
						<tn-icon name="qq-fill" color="#12B7F5" size="50rpx"></tn-icon>
						<tn-icon name="weibo-fill" color="#FF2442" size="50rpx"></tn-icon>
					</view>
				</view> -->
			</view>

			<!-- 忘记密码表单 -->
			<view class="form-container" v-if="state.currentTab === 'forget'">
				<view class="form-item">
					<tn-input v-model="state.forgetForm.email" placeholder="请输入邮箱" border clearable></tn-input>
				</view>

				<view class="form-item code-input">
					<tn-input v-model="state.forgetForm.code" placeholder="请输入验证码" type="number" prefix-icon="shield" border clearable></tn-input>
					<tn-button bg-color="#244851" text-color="#fff" height="37px" font-size="14px" :disabled="state.codeCountdown > 0" @click="getVerificationCode">
						{{ state.codeCountdown > 0 ? `${state.codeCountdown}s后重试` : '获取验证码' }}
					</tn-button>
				</view>

				<view class="form-item">
					<tn-input v-model="state.forgetForm.newPassword" placeholder="请输入新密码" type="password" prefix-icon="lock" border clearable></tn-input>
				</view>

				<view class="form-item">
					<tn-input v-model="state.forgetForm.confirmPassword" placeholder="请再次输入新密码" type="password" prefix-icon="lock" border clearable></tn-input>
				</view>

				<tn-button shape="round" bg-color="#244851" text-color="#fff" width="100%" height="90rpx" @click="handleResetPassword">
					修改密码
				</tn-button>

				<view class="back-login">
					<text @click="state.currentTab = 'login'">返回登录</text>
				</view>
			</view>
		</view>
	</uni-popup>


</template>

<script setup>
	import md5 from 'js-md5'

	import {
		ref,
		reactive,
		watch
	} from 'vue'
	import {
		apiUserLogin,
		apiUserReset,
		apiUserGetCodeForEmail
	} from '@/api/user'
	import {
		Local,
		StorageKey
	} from '@/utils/storage'
	import {
		useStoreUserInfo
	} from '@/stores/userInfo'

	const storeUserInfo = useStoreUserInfo()

	const props = defineProps({
		// 是否可以点击蒙版关闭弹窗
		is_mask_click: {
			type: Boolean,
			default: true,
			required: false
		}
	})
	const emit = defineEmits(['closed'])

	const refPopup = ref()
	const state = reactive({
		currentTab: 'login', // 'login' 或 'forget'
		codeCountdown: 0,
		loginForm: {
			email: '',
			password: '',
			remember: false
		},
		forgetForm: {
			email: '',
			code: '',
			newPassword: '',
			confirmPassword: ''
		}
	})

	const onChangePopup = (e) => {
		// console.log('e', e)
		const isShowLogin = e.show
		if (isShowLogin) {
			// 打开
			autoLogin() // 检测自动登录
		} else {
			// 关闭
			storeUserInfo.setIsShowLogin(false)

			// 清空
			state.currentTab = 'login'
			state.codeCountdown = 0
			state.loginForm.email = ''
			state.loginForm.password = ''
			state.loginForm.remember = false
			state.forgetForm.email = ''
			state.forgetForm.code = ''
			state.forgetForm.newPassword = ''
			state.forgetForm.confirmPassword = ''
		}
	}

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
				state.loginForm.email = autoLogin.user
				state.loginForm.password = autoLogin.password
				state.loginForm.remember = remember
				postLogin(false)
			}
		}
	}

	// 获取验证码
	const getVerificationCode = () => {
		if (!state.forgetForm.email || !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(state.forgetForm.email)) {
			uni.showToast({
				title: '请输入正确的邮箱',
				icon: 'none'
			})
			return
		}

		// 解决 /api/user/get_code_for_email 白名单的问题
		const token = storeUserInfo.token
		storeUserInfo.setToken('')

		const para = {
			email: `${state.forgetForm.email}`
		}
		apiUserGetCodeForEmail(para)
			.then((res) => {
				// console.log('res', res)
				state.btnLoading = false
				if (res.code === 0) {
					// 发送成功
					uni.showToast({
						title: '验证码已发送',
						icon: 'none'
					})
					// 验证码倒计时
					state.codeCountdown = 60
					const timer = setInterval(() => {
						state.codeCountdown--
						if (state.codeCountdown <= 0) {
							clearInterval(timer)
						}
					}, 1000)
				} else if (res.code === 1) {
					// 当天发送验证码过多
					uni.showToast({
						icon: 'error',
						title: '验证码发送过多'
					})
					// 验证码倒计时
					state.codeCountdown = 60
					const timer = setInterval(() => {
						state.codeCountdown--
						if (state.codeCountdown <= 0) {
							clearInterval(timer)
						}
					}, 1000)
				} else if (res.code === -1) {
					// 账号格式错误
					uni.showToast({
						icon: 'error',
						title: '账号格式错误'
					})
				} else if (res.code === -2) {
					// 账号不可用
					uni.showToast({
						icon: 'error',
						title: '账号不可用'
					})
				}
				if (token) storeUserInfo.setToken(token) // 解决 /api/user/get_code_for_email 白名单的问题
			})
			.catch(() => {
				uni.showToast({
					icon: 'error',
					title: '发送失败'
				})
				if (token) storeUserInfo.setToken(token) // 解决 /api/user/get_code_for_email 白名单的问题
			})
	}

	// 登录
	const handleLogin = () => {
		if (!state.loginForm.email || !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(state.loginForm.email)) {
			uni.showToast({
				title: '请输入正确的邮箱',
				icon: 'none'
			})
			return
		}

		if (!state.loginForm.password) {
			uni.showToast({
				title: '请输入密码',
				icon: 'none'
			})
			return
		}

		postLogin()
	}

	// 请求登录
	const postLogin = (ifMD5 = true) => {
		if (ifMD5) uni.showLoading({
			icon: 'loading',
			title: '登录中...'
		})
		const para = {
			user: `${state.loginForm.email}`,
			password: ifMD5 ? md5(state.loginForm.password) : state.loginForm.password
		}
		// console.log('para', para)
		apiUserLogin(para)
			.then((res) => {
				// console.log('res', res)
				if (ifMD5) uni.hideLoading()
				const token = res.token
				if (token === '') {
					// 登录失败
					if (ifMD5) uni.showToast({
						icon: 'error',
						title: '账号或密码错误'
					})

					// 取消自动登录
					state.loginForm.remember = false
					Local.remove(StorageKey.AutoLogin)

					// 存储 token
					storeUserInfo.setToken('')
					// 存储样本信息
					storeUserInfo.clearUserInfos()
				} else {
					// 登录成功
					if (ifMD5) uni.showToast({
						icon: 'success',
						title: '登录成功'
					})
					else uni.showToast({
						icon: 'success',
						title: '自动登录成功'
					})

					// 存储 token
					storeUserInfo.setToken(token)
					// 存储样本信息
					storeUserInfo.setUserInfos({
						'id': res.info.id,
						'role': res.info.role,
						'name': res.info.name,
						'email': res.info.email
					})

					if (state.loginForm.remember) {
						// 自动登录
						Local.set(StorageKey.AutoLogin, para)
					} else {
						// 取消自动登录
						Local.remove(StorageKey.AutoLogin)
					}

					// 刷新页面
					storeUserInfo.setIsReLoad(true)

					refPopup.value.close()

					emit('closed')
				}
			})
			.catch(() => {
				if (ifMD5) uni.hideLoading()
				// 取消自动登录
				state.loginForm.remember = false
				Local.remove(StorageKey.AutoLogin)
			})
	}

	// 重置密码
	const handleResetPassword = () => {
		if (!state.forgetForm.email || !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(state.forgetForm.email)) {
			uni.showToast({
				title: '请输入正确的邮箱',
				icon: 'none'
			})
			return
		}

		if (!state.forgetForm.code) {
			uni.showToast({
				title: '请输入验证码',
				icon: 'none'
			})
			return
		}

		if (!state.forgetForm.newPassword) {
			uni.showToast({
				title: '请输入新密码',
				icon: 'none'
			})
			return
		}

		if (state.forgetForm.newPassword !== state.forgetForm.confirmPassword) {
			uni.showToast({
				title: '两次输入的密码不一致',
				icon: 'none'
			})
			return
		}

		// 修改密码
		postReset()
	}

	// 修改密码
	const postReset = () => {
		uni.showLoading({
			icon: 'loading',
			title: '修改中...'
		})

		// 解决 /api/user/get_code_for_email 白名单的问题
		const token = storeUserInfo.token
		storeUserInfo.setToken('')

		const para = {
			user: `${state.forgetForm.email}`,
			code: `${state.forgetForm.code}`,
			password: md5(state.forgetForm.newPassword)
		}
		apiUserReset(para)
			.then((res) => {
				uni.hideLoading()
				// console.log('res', res)
				state.loadingLogin = false
				if (res.code === 0) {
					// 成功
					uni.showToast({
						icon: 'success',
						title: '修改密码成功'
					})
					state.loginForm.remember = true
					state.currentTab = 'login'
				} else {
					// 失败
					uni.showToast({
						icon: 'error',
						title: '账号或验证码错误'
					})
				}
				if (token) storeUserInfo.setToken(token) // 解决 /api/user/get_code_for_email 白名单的问题
			})
			.catch(() => {
				uni.hideLoading()
				uni.showToast({
					icon: 'error',
					title: '操作失败'
				})
				if (token) storeUserInfo.setToken(token) // 解决 /api/user/get_code_for_email 白名单的问题
			})
	}

	watch(
		() => storeUserInfo.isShowLogin,
		(isShowLogin) => {
			// console.log('isShowLogin', isShowLogin)
			if (isShowLogin) refPopup.value.open()
		})
</script>

<style scoped lang="scss">
	.login-container {
		padding: 40rpx;
		background-color: #fff;
		height: 70vh;
		width: 90vw;
		border-radius: 20rpx;
	}

	.login-header {
		margin-bottom: 50rpx;
		text-align: center;
	}

	.login-header .title {
		display: block;
		font-size: 42rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.login-header .subtitle {
		display: block;
		font-size: 28rpx;
		color: #999;
	}

	.tab-container {
		display: flex;
		justify-content: center;
		margin-bottom: 40rpx;
		border-bottom: 1px solid #eee;
	}

	.tab-item {
		padding: 20rpx 40rpx;
		font-size: 32rpx;
		color: #666;
		position: relative;
	}

	.tab-item.active {
		color: #244851;
		font-weight: bold;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60rpx;
		height: 6rpx;
		background-color: #244851;
		border-radius: 3rpx;
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.code-input {
		display: flex;
		align-items: center;
	}

	.code-input .tn-input {
		flex: 1;
		margin-right: 20rpx;
	}

	.remember-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
		font-size: 28rpx;
		color: #666;
	}

	.forget-link {
		color: #244851;
	}

	.other-login {
		margin-top: 60rpx;
		text-align: center;
	}

	.divider {
		display: block;
		position: relative;
		color: #999;
		font-size: 26rpx;
		margin-bottom: 30rpx;
	}

	.divider::before,
	.divider::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 30%;
		height: 1px;
		background-color: #eee;
	}

	.divider::before {
		left: 0;
	}

	.divider::after {
		right: 0;
	}

	.login-icons {
		display: flex;
		justify-content: center;
		gap: 40rpx;
	}

	.back-login {
		text-align: center;
		margin-top: 30rpx;
		color: #244851;
		font-size: 28rpx;
	}
</style>