<template>
	<div class="nav">
		<div class="nav-side">
			<tn-icon :name="state.isBack2Home ? 'home' : 'left'" bold size="22px" custom-class="nav-back" @click="onBack" />
		</div>
		<div class="nav-title-container">
			<span class="nav-title">报告详情</span>
			<!-- <tn-loading :show="state.isLoading" animation color="#fff" mode="flower" /> -->
		</div>
		<div class="nav-side">
			<tn-icon name="download-simple" bold size="22px" custom-class="nav-btn" @click="onDownload" />
		</div>
	</div>

	<web-view :src="state.allUrl" @load="onWebViewLoad" @error="onWebViewError" style="margin-top: 100rpx"></web-view>

</template>

<script setup>
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		onMounted,
		onUnmounted
	} from 'vue'

	const state = reactive({
		isBack2Home: false,
		viewerUrl: '/static/pdfjs/web/viewer.html',
		allUrl: '',
		downloadUrl: '',
		// isLoading: true,
		// loadingTimer: null
	})

	onLoad((option) => {
		// console.log('onLoad', option)
		// let url = option.url.replace('http://58.215.216.131:5555/', 'http://tzlims.pangao.vip:5555/')
		state.downloadUrl = decodeURIComponent(option.url)
		state.allUrl = state.viewerUrl + '?file=' + encodeURIComponent(state.downloadUrl)
		// console.log('state.allUrl', state.allUrl)
		// console.log('state.downloadUrl', state.downloadUrl)
	})

	onMounted(() => {
		// console.log('onMounted')
		const pages = getCurrentPages()
		state.isBack2Home = pages.length == 1

		// state.isLoading = true

		// // 设置3秒后自动关闭loading
		// state.loadingTimer = setTimeout(() => {
		// 	state.isLoading = false
		// }, 3000)
	})

	// 清除定时器
	// onUnmounted(() => {
	// 	if (state.loadingTimer) {
	// 		clearTimeout(state.loadingTimer)
	// 		state.loadingTimer = null
	// 	}
	// })

	// 返回上一页
	const onBack = () => {
		if (state.isBack2Home) {
			uni.redirectTo({
				url: '/pages/index/index'
			})
		} else {
			uni.navigateBack()
		}
	}

	const onDownload = () => {
		window.open(state.downloadUrl)
	}

	// 加载完成
	const onWebViewLoad = () => {
		// console.log('onWebViewLoad')
		state.isLoading = false
	}
	// 加载失败
	const onWebViewError = () => {
		// console.log('onWebViewError')
		state.isLoading = false
	}

	// 字符串 转 Base64
	const base64Encode = (str) => {
		const encoder = new TextEncoder()
		const uint8Array = encoder.encode(str)
		return uni.arrayBufferToBase64(uint8Array)
	}
	// Base64 转 字符串
	const base64Decode = (base64) => {
		const uint8Array = uni.base64ToArrayBuffer(base64)
		const decoder = new TextDecoder()
		return decoder.decode(uint8Array)
	}
</script>

<style lang="scss" scoped>
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		height: 100rpx;
		background: #244851; // linear-gradient(135deg, #3A7BFF 0%, #5A9AFF 100%);
		display: flex;
		align-items: center;
		padding: 0 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(58, 123, 255, 0.2);
	}

	.nav-title-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-title {
		color: #fff;
		font-size: 36rpx;
		font-weight: 500;
		letter-spacing: 1rpx;
		text-align: center;
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
</style>