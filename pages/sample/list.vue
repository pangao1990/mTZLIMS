<template>
	<tn-notify ref="refNotify" />

	<div class="app-container">

		<!-- 顶部导航栏 - 更简洁的设计 -->
		<div class="nav">
			<div class="nav-side">
				<tn-icon :name="state.isBack2Home ? 'home' : 'left'" bold size="22px" custom-class="nav-back" @click="onBack" />
			</div>
			<span class="nav-title">样本列表</span>
			<div class="nav-side">
				<tn-icon name="add" bold size="22px" custom-class="nav-btn" @click="onAdd" />
			</div>
		</div>

		<!-- 加载状态 - 更精致的动画 -->
		<div class="loading-overlay" v-if="state.loading">
			<div class="loading-content">
				<div class="spinner">
					<div class="double-bounce1"></div>
					<div class="double-bounce2"></div>
				</div>
				<div class="loading-message">数据加载中</div>
			</div>
		</div>

		<div class="content-wrapper">
			<!-- 搜索栏 - 更现代化的设计 -->
			<div class="search-wrapper">
				<tn-search-box v-model="state.search" placeholder="输入检索关键词" shape="round" search-button-bg-color="#244851" bg-color="#fff" input-align="left" @search="onSearch"
					@clear="onClear">
					<template #left>
						<tn-icon name="search" size="18" color="#999" />
					</template>
				</tn-search-box>
			</div>

			<!-- 列表 - 卡片式设计优化 -->
			<div class="sample-list">
				<div class="sample-card" v-for="(item, index) in state.data" :key="index" @click="gotoInfo(item.id)">
					<div class="card-header">
						<div class="sample-name">{{ item.name }}</div>
						<div class="sample-id">{{ item.sample_id }}</div>
					</div>

					<div class="product-tags" v-if="item.product && item.product.length">
						<div class="tag" v-for="(productItem, productIndex) in item.product" :key="productIndex">
							{{ productItem.name }}
						</div>
					</div>

					<div class="card-footer">
						<div class="status-badge" :class="'status-' + getStatusType(item.sample_state)">
							{{ item.sample_state }}
						</div>
						<template v-if="item.sell.name != '' && item.sell.id != item.userId">
							<div class="sample-date">
								{{ item.sample_state_date }}
							</div>
							<div class="sell">
								{{ item.sell.name.slice(0, 5) }}{{ item.sell.name.length > 5 ? '...' : '' }}
							</div>
						</template>
						<div v-else class="sample-date right-align">
							{{ item.sample_state_date }}
						</div>
					</div>
				</div>
			</div>

			<!-- 加载更多 - 更友好的交互提示 -->
			<div class="load-more">
				<div v-if="state.statusLoadMore === 'loading'" class="loading-state">
					<tn-loading size="18" color="#244851"></tn-loading>
					<span>正在加载...</span>
				</div>
				<div v-else-if="state.statusLoadMore === 'nomore'" class="no-more-data">
					<span>已经到底了</span>
				</div>
				<div v-else class="load-more-prompt" @click="onMore">
					<span>上拉加载更多</span>
				</div>
			</div>
		</div>
	</div>

	<!-- 登录 -->
	<Login :is_mask_click="false" />
</template>

<script setup>
	import Login from '/pages/login/index.vue'

	import {
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		onMounted,
		watch
	} from 'vue'
	import {
		useStoreUserInfo
	} from '@/stores/userInfo'
	import {
		apiApplicationGetList
	} from '@/api/sample'

	const storeUserInfo = useStoreUserInfo()

	const refNotify = ref()
	const state = reactive({
		isBack2Home: false,
		search: '',
		loading: false,
		page: 1,
		pageSize: 10,
		data: [],
		dataTotal: 0,
		statusLoadMore: 'loadmore'
	})

	// 状态类型映射
	const getStatusType = (status) => {
		const typeMap = {
			'接收中': 'info',
			'已接收': 'primary',
			'检测中': 'warning',
			'已完成': 'success',
			'退检': 'error',
			'返样': 'warning',
			'让步接收': 'primary',
			'拒绝接收': 'error',
			'报告撤回': 'error'
		}
		return typeMap[status] || 'default'
	}

	onMounted(() => {
		postList()

		const pages = getCurrentPages()
		state.isBack2Home = pages.length == 1
	})

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

	// 新增样本
	const onAdd = () => {
		uni.navigateTo({
			url: '/pages/sample/add'
		})
	}

	// 下拉刷新
	onPullDownRefresh(() => {
		state.search = ''
		onSearch()
	})

	// 上拉加载更多
	onReachBottom(() => {
		if (Math.ceil(state.dataTotal / state.pageSize) > state.page) {
			state.page += 1
			postList()
		}
	})

	// 清空搜索
	const onClear = () => {
		state.search = ''
		onSearch()
	}

	// 执行搜索
	const onSearch = () => {
		state.page = 1
		state.data = []
		postList()
	}

	// 跳转到详情页
	const gotoInfo = (id) => {
		uni.navigateTo({
			url: `/pages/sample/add?sample_info_id=${id}`
		})
	}

	// 点击加载更多
	const onMore = () => {
		if (Math.ceil(state.dataTotal / state.pageSize) > state.page) {
			state.page += 1
			postList()
		}
	}

	// 获取样本列表
	const postList = () => {
		state.statusLoadMore = 'loading'
		if (state.page === 1) {
			state.loading = true
		}

		let search = state.search
		if (search !== '') {
			search = search.replace('检测中', '实验中\n报告中')
		}
		const params = {
			page: state.page,
			size: state.pageSize,
			search: {
				'all': search
			}
		}

		apiApplicationGetList(params)
			.then((res) => {
				// console.log('res', res)
				const processedList = res.list.map(item => {
					if (['实验中', '报告中'].includes(item.sample_state)) {
						item.sample_state = '检测中'
					}
					return item
				})

				state.data = state.page === 1 ? processedList : [...state.data, ...processedList]
				state.dataTotal = res.total

				if (state.data.length >= state.dataTotal) {
					state.statusLoadMore = 'nomore'
				} else {
					state.statusLoadMore = 'loadmore'
				}
			})
			.catch((e) => {
				// console.error('获取样本列表失败:', e)
				refNotify.value.show({
					msg: '获取数据失败 => ' + str(e),
					type: 'error'
				})
			})
			.finally(() => {
				state.loading = false
				uni.stopPullDownRefresh()
			})
	}

	watch(
		() => storeUserInfo.isReLoad,
		(isReLoad) => {
			if (isReLoad) {
				postList()
				storeUserInfo.setIsReLoad(false)
			}
		})
</script>

<style lang="scss" scoped>
	.app-container {
		min-height: 100vh;
		background-color: #f8f9fa;
		display: flex;
		flex-direction: column;
	}

	/* 顶部导航栏 - 更现代的设计 */
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

	/* 加载动画 - 更流畅的效果 */
	.loading-overlay {
		position: fixed;
		top: 88rpx;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255, 255, 255, 0.9);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;

		.loading-content {
			display: flex;
			flex-direction: column;
			align-items: center;

			.spinner {
				width: 50px;
				height: 50px;
				position: relative;
				margin-bottom: 15px;

				.double-bounce1,
				.double-bounce2 {
					width: 100%;
					height: 100%;
					border-radius: 50%;
					background-color: #244851;
					opacity: 0.6;
					position: absolute;
					top: 0;
					left: 0;
					animation: bounce 2.0s infinite ease-in-out;
				}

				.double-bounce2 {
					animation-delay: -1.0s;
				}
			}

			.loading-message {
				color: #666;
				font-size: 14px;
			}
		}
	}

	@keyframes bounce {

		0%,
		100% {
			transform: scale(0.0);
		}

		50% {
			transform: scale(1.0);
		}
	}

	/* 内容区域 */
	.content-wrapper {
		flex: 1;
		padding: 20rpx 30rpx;
	}

	/* 搜索栏 - 更突出的设计 */
	.search-wrapper {
		margin-left: -30rpx;
		margin-right: -30rpx;
		margin-bottom: 20rpx;
		position: sticky;
		top: 100rpx;
		z-index: 90;
		background-color: #f8f9fa;
		padding: 20rpx 30rpx;
	}

	/* 样本列表 - 卡片式设计 */
	.sample-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.sample-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(58, 123, 255, 0.08);
		transition: transform 0.2s, box-shadow 0.2s;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 2rpx 8rpx rgba(58, 123, 255, 0.1);
		}

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;

			.sample-name {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				flex: 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.sample-id {
				font-size: 24rpx;
				color: #999;
				margin-left: 20rpx;
			}
		}

		.product-tags {
			display: block;
			margin-bottom: 20rpx;

			.tag {
				// background-color: #F5F5F5;
				color: #7D7D7D;
				padding: 6rpx 6rpx;
				border-radius: 30rpx;
				font-size: 24rpx;
				line-height: 1.4;
			}
		}

		.card-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 20rpx;
			border-top: 1rpx solid #E6E6E6;
			gap: 10rpx;

			.sample-date {
				font-size: 24rpx;
				color: #999;
				flex-shrink: 0;

				&.right-align {
					margin-left: auto;
				}
			}

			.sell {
				font-size: 24rpx;
				color: #666;
				flex-shrink: 0;
				padding: 0 10rpx;
				text-align: right;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.status-badge {
				font-size: 24rpx;
				padding: 6rpx 26rpx;
				border-radius: 30rpx;
				font-weight: 500;
				flex-shrink: 0;

				&.status-info {
					background-color: #F4F4F5;
					color: #919398;
				}

				&.status-primary {
					background-color: #EEF5FE;
					color: #5A9CF8;
				}

				&.status-success {
					background-color: #F2F9EC;
					color: #7EC050;
				}

				&.status-warning {
					background-color: #FCF6ED;
					color: #DCA550;
				}

				&.status-error {
					background-color: #FCF0F0;
					color: #E47470;
				}

				&.status-default {
					background-color: #FFFFFF;
					color: #606266;
				}
			}
		}
	}

	/* 加载更多 - 更明显的交互提示 */
	.load-more {
		padding: 40rpx 0;
		text-align: center;
		color: #999;
		font-size: 28rpx;

		.loading-state {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 10rpx;
		}

		.no-more-data {
			color: #ccc;
		}

		.load-more-prompt {
			&:active {
				color: #244851;
			}
		}
	}
</style>