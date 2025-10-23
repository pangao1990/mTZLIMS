<template>
	<tn-notify ref="refNotify" />
	<tn-modal ref="refModal" />

	<div class="app-container">

		<!-- 顶部导航栏 - 更简洁的设计 -->
		<div class="nav">
			<div class="nav-side">
				<tn-icon :name="state.isBack2Home ? 'home' : 'left'" bold size="22px" custom-class="nav-back" @click="onBack" />
			</div>
			<span class="nav-title">报告列表</span>
			<div class="nav-side">
				<tn-icon name="folder-download" bold size="22px" custom-class="nav-btn" @click="onDownloads" />
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
				<tn-button @click="onSearchAdvOpen" text :text-color="state.isUse ? '#BABABA' : '#244851'" font-size="30rpx" class="search-button-float"><span
						:class="{'red':searchAdv.isRed}">高级</span></tn-button>
				<div class="search-input-float">
					<tn-search-box v-model="state.search" placeholder="输入检索关键词" shape="round" search-button-bg-color="#244851" bg-color="#fff" input-align="left" @search="onSearch"
						@clear="onClear">
						<template #left>
							<tn-icon name="search" size="18" color="#999" />
						</template>
					</tn-search-box>
				</div>
			</div>

			<!-- 列表 - 卡片式设计优化 -->
			<div class="sample-list">
				<div class="sample-card" v-for="(item, index) in state.data" :key="index" @click="gotoInfo(item.sample_info.id)">
					<div class="card-header">
						<div class="sample-name" :class="{'underline': item.report_state == '已发布'}">
							<span>{{ item.sample_info.name }}</span>
						</div>
						<div class="sample-id">{{ item.sample_info.sample_id }}</div>
					</div>

					<div class="product-tags" v-if="item.product && item.product.length">
						<div class="tag" v-for="(productItem, productIndex) in item.product" :key="productIndex">
							{{ productItem.name }}
						</div>
					</div>

					<div class="card-details">
						<div class="detail-item">
							<span class="detail-label">送检单位：</span>
							<span class="detail-value">{{item.sample_info.hospital}}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">采样时间：</span>
							<span class="detail-value">{{item.sample_info.collection_date}}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">发布时间：</span>
							<span class="detail-value">{{item.lab_info.lab_release_date}}</span>
						</div>
					</div>

					<div class="card-footer">
						<div class="status-badge" :class="'status-' + getStatusType(item.report_state)">
							{{ item.report_state }}
						</div>
						<div class="action-buttons">
							<div class="action-btn preview-btn" @tap.stop="onDownload(item.id, item.report_state)">
								<tn-icon name="eye" size="26" color="#244851" />
								<span>预览</span>
							</div>
							<div class="action-btn download-btn" @tap.stop="onDownload(item.id, item.report_state, 'download')">
								<tn-icon name="download-simple" size="26" color="#244851" />
								<span>下载</span>
							</div>
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

	<!-- 高级检索 -->
	<tn-popup v-model="searchAdv.showPopup" open-direction="top" :height="searchAdv.heightPopup">
		<div class="search-adv">
			<div class="title">高级检索</div>
			<div class="search-title">
				采样时间
				<tn-button size="sm" class="ml10" bg-color="#244851" text-color="#ffffff" @click="onDateWeekOrMonth('collection_date', 7)">近一周</tn-button>
				<tn-button size="sm" class="ml10" bg-color="#244851" text-color="#ffffff" @click="onDateWeekOrMonth('collection_date', 30)">近一个月</tn-button>
			</div>
			<div class="search-content">
				<tn-input v-model="searchAdv.collection_date" placeholder="请选择采样时间" clearable :disabled="searchAdv.dateRangeVisible&&searchAdv.dateRangeType=='collection_date'"
					@focus="onDateRangeOpen('collection_date')" />
			</div>
			<div class="search-title">
				发布时间
				<tn-button size="sm" class="ml10" bg-color="#244851" text-color="#ffffff" @click="onDateWeekOrMonth('lab_release_date', 7)">近一周</tn-button>
				<tn-button size="sm" class="ml10" bg-color="#244851" text-color="#ffffff" @click="onDateWeekOrMonth('lab_release_date', 30)">近一个月</tn-button>
			</div>
			<div class="search-content">
				<tn-input v-model="searchAdv.lab_release_date" placeholder="请选择发布时间" clearable :disabled="searchAdv.dateRangeVisible&&searchAdv.dateRangeType=='lab_release_date'"
					@focus="onDateRangeOpen('lab_release_date')" />
			</div>
			<div class="search-title">检测项目</div>
			<div class="search-content">
				<tn-input v-model="searchAdv.product_name" placeholder="请输入检测项目" clearable />
			</div>
			<div class="search-title">送检单位</div>
			<div class="search-content">
				<zxz-uni-data-select v-model="searchAdv.hospital" :localdata="searchAdv.hospitalList" clear filterable placeholder="请选择送检单位" emptyTips="无数据"></zxz-uni-data-select>
			</div>
			<div class="search-title">姓名</div>
			<div class="search-content">
				<tn-input v-model="searchAdv.name" placeholder="请输入姓名" clearable />
			</div>
			<div class="button-group">
				<div class="btn btn-search" @click="onSearchAdv">检索</div>
				<div class="btn btn-clear" @click="onSearchAdvClear">清空</div>
			</div>
		</div>
		<hbxw-date-range-picker :title="searchAdv.dateRangeType=='collection_date' ? '选择采样时间':'选择发布时间'" :visible="searchAdv.dateRangeVisible" @sure="onDateRangeSure"
			@cancel="onDateRangeCancel" />
	</tn-popup>
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
		apiReportGetList,
		apiReportDownload,
		apiReportDownloads
	} from '@/api/sample'
	import {
		apiHospitalGetList
	} from '@/api/weixin'

	const storeUserInfo = useStoreUserInfo()

	const refNotify = ref()
	const refModal = ref()
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
	// 高级搜索
	const searchAdv = reactive({
		showPopup: false,
		heightPopup: 1250,
		dateRangeVisible: false,
		dateRangeType: '',
		collection_date: '',
		lab_release_date: '',
		product_name: '',
		hospital: '',
		hospitalList: [],
		name: '',
		search: {},
		isRed: false
	})

	// 状态类型映射
	const getStatusType = (status) => {
		const typeMap = {
			'未发布': 'info',
			'已发布': 'success',
			'已撤回': 'error'
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

	// 高级检索
	const onSearchAdvOpen = () => {
		searchAdv.heightPopup = 1250
		searchAdv.dateRangeVisible = false
		searchAdv.showPopup = true
		getHospitalList()
	}
	const getHospitalList = () => {
		const para = {
			userId: storeUserInfo.userInfos.id
		}
		apiHospitalGetList(para)
			.then((res) => {
				// console.log('res', res)
				searchAdv.hospitalList = res.list.map((item) => {
					return {
						value: item,
						text: item
					}
				})
			})
	}
	const onDateWeekOrMonth = (type, n = 7) => {
		const pad = n => String(n).padStart(2, '0')

		const today = new Date()
		const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 0)
		const start = new Date(end)
		start.setDate(end.getDate() - n)
		start.setHours(0, 0, 0, 0)

		const format = d =>
			`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

		const dateRange = [format(start), format(end)]
		// console.log('dateRange', dateRange)

		if (type == 'collection_date') searchAdv.collection_date = dateRange
		else if (type == 'lab_release_date') searchAdv.lab_release_date = dateRange
	}
	const onDateRangeOpen = (type) => {
		searchAdv.dateRangeType = type
		searchAdv.heightPopup = 1250
		searchAdv.dateRangeVisible = true
	}
	const onDateRangeSure = (e) => {
		// console.log(e)
		const dateRange = [`${e.start[0]}-${e.start[1]}-${e.start[2]} ${e.start[3]}:${e.start[4]}:${e.start[5]}`,
			`${e.end[0]}-${e.end[1]}-${e.end[2]} ${e.end[3]}:${e.end[4]}:${e.end[5]}`
		]
		if (searchAdv.dateRangeType == 'collection_date') searchAdv.collection_date = dateRange
		else if (searchAdv.dateRangeType == 'lab_release_date') searchAdv.lab_release_date = dateRange
		searchAdv.dateRangeVisible = false
		searchAdv.heightPopup = 1250
	}
	const onDateRangeCancel = () => {
		searchAdv.dateRangeVisible = false
		searchAdv.heightPopup = 1250
	}
	const onSearchAdvClear = () => {
		searchAdv.dateRangeVisible = false
		searchAdv.collection_date = ''
		searchAdv.lab_release_date = ''
		searchAdv.product_name = ''
		searchAdv.hospital = ''
		searchAdv.name = ''
		searchAdv.search = {}
		searchAdv.isRed = false
		searchAdv.showPopup = false
		postList()
	}
	const onSearchAdv = () => {
		searchAdv.search = {}
		if (searchAdv.collection_date != '') searchAdv.search['sample_info.collection_date'] = searchAdv.collection_date
		if (searchAdv.lab_release_date != '') searchAdv.search['lab_info.lab_release_date'] = searchAdv.lab_release_date
		if (searchAdv.hospital != '') searchAdv.search['sample_info.hospital'] = searchAdv.hospital
		if (searchAdv.name != '') searchAdv.search['sample_info.name'] = searchAdv.name
		if (searchAdv.product_name != '') searchAdv.search['productName'] = searchAdv.product_name
		if (JSON.stringify(searchAdv.search) !== '{}') searchAdv.isRed = true
		searchAdv.showPopup = false
		postList()
	}

	// 跳转到详情页
	const onDownload = (report_info_id, report_state, type = '') => {
		if (report_state == '已发布') postDownloadReport(report_info_id, type)
		else if (report_state == '未发布') refNotify.value.show({
			msg: '报告暂未发布',
			type: 'warning'
		})
		else if (report_state == '已撤回') refNotify.value.show({
			msg: '报告已撤回',
			type: 'error'
		})
	}
	// 下载报告
	const postDownloadReport = (report_info_id, type = '') => {
		const para = {
			ids: [report_info_id]
		}
		// console.log('para', para)
		apiReportDownload(para)
			.then((res) => {
				// console.log('res', res)
				if (res['url'] == '') refNotify.value.show({
					msg: '获取报告失败',
					type: 'warning'
				})
				else {
					if (res['url'].slice(-4) == '.pdf' || res['url'].slice(-4) == '.PDF') {
						if (type == 'download') window.open(res['url'])
						// 查看pdf
						else uni.navigateTo({
							url: `/pages/sample/pdf?url=${encodeURIComponent(res['url'])}`
						})
					} else {
						// 下载
						// #ifdef H5
						window.open(res['url'])
						// #endif
						// #ifndef H5
						uni.downloadFile({
							url: res['url'],
							success: (res) => {
								// console.log('res', res)
								if (res.statusCode === 200) {
									// console.log('下载成功')
									uni.saveFile({
										tempFilePath: res.tempFilePath,
										success: (res) => {
											// console.log('saveFile', res)
											const savedFilePath = res.savedFilePath
											refNotify.value.show({
												type: 'error',
												msg: '下载成功'
											})
											uni.showModal({
												title: '提示消息',
												content: '报告保存在 ' + savedFilePath,
												showCancel: false
											})
										},
										fail: (e) => {
											refNotify.value.show({
												type: 'error',
												msg: '保存报告失败：' + e
											})
										}
									})
								} else {
									refNotify.value.show({
										type: 'error',
										msg: '下载失败：' + res
									})
								}
							},
							fail: (e) => {
								refNotify.value.show({
									type: 'error',
									msg: '下载失败：' + e
								})
							}
						})
						// #endif
					}
				}
			})
			.catch(() => {
				refNotify.value.show({
					type: 'error',
					msg: '获取报告失败',
					safeAreaInsetTop: true
				})
			})
	}

	// 批量下载报告
	const onDownloads = () => {
		state.loading = true
		const para = {
			search: {
				'all': state.search
			},
			'searchAdv': searchAdv.search
		}
		// console.log('para', para)
		apiReportDownloads(para)
			.then((res) => {
				// console.log('res', res)
				state.loading = false
				if (res['code'] == 1) refNotify.value.show({
					msg: '未找到可下载的报告',
					type: 'warning'
				})
				else if (res['url'] == '') refNotify.value.show({
					msg: '获取报告失败',
					type: 'warning'
				})
				else {
					if (res['url'].slice(-4) == '.pdf' || res['url'].slice(-4) == '.PDF') {
						if (type == 'download') window.open(res['url'])
						// 查看pdf
						else uni.navigateTo({
							url: `/pages/sample/pdf?url=${encodeURIComponent(res['url'])}`
						})
					} else {
						// 下载
						// #ifdef H5
						window.open(res['url'])
						// #endif
						// #ifndef H5
						uni.downloadFile({
							url: res['url'],
							success: (res) => {
								// console.log('res', res)
								if (res.statusCode === 200) {
									// console.log('下载成功')
									uni.saveFile({
										tempFilePath: res.tempFilePath,
										success: (res) => {
											// console.log('saveFile', res)
											const savedFilePath = res.savedFilePath
											refNotify.value.show({
												type: 'error',
												msg: '下载成功'
											})
											uni.showModal({
												title: '提示消息',
												content: '报告保存在 ' + savedFilePath,
												showCancel: false
											})
										},
										fail: (e) => {
											refNotify.value.show({
												type: 'error',
												msg: '保存报告失败：' + e
											})
										}
									})
								} else {
									refNotify.value.show({
										type: 'error',
										msg: '下载失败：' + res
									})
								}
							},
							fail: (e) => {
								refNotify.value.show({
									type: 'error',
									msg: '下载失败：' + e
								})
							}
						})
						// #endif
					}
				}
			})
			.catch(() => {
				state.loading = false
				refNotify.value.show({
					type: 'error',
					msg: '获取报告失败',
					safeAreaInsetTop: true
				})
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
		const params = {
			page: state.page,
			size: state.pageSize,
			search: {
				'all': state.search
			},
			'searchAdv': searchAdv.search
		}
		// console.log('params', params)
		apiReportGetList(params)
			.then((res) => {
				// console.log('res', res)

				const processedList = res.list

				state.data = state.page === 1 ? processedList : [...state.data, ...processedList]
				state.dataTotal = res.total

				if (state.data.length >= state.dataTotal) {
					state.statusLoadMore = 'nomore'
				} else {
					state.statusLoadMore = 'loadmore'
				}
			})
			.catch(err => {
				// console.error('获取报告列表失败:', err)
				refNotify.value.show({
					msg: '获取数据失败，请重试',
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
		padding: 10rpx 30rpx 20rpx 30rpx;
	}

	/* 搜索栏 */
	.search-wrapper {
		margin-left: -30rpx;
		margin-right: -30rpx;
		position: sticky;
		top: 100rpx;
		z-index: 100;
		background-color: #f8f9fa;
		padding: 20rpx 30rpx;
		overflow: hidden;

		/* 按钮浮动在右侧 */
		.search-button-float {
			float: right;
			margin-left: 10rpx;
			margin-top: 5px;
			white-space: nowrap;
		}

		.red {
			color: red;
			font-weight: bold;
		}

		/* 搜索框占据剩余空间 */
		.search-input-float {
			display: block;
			overflow: hidden;
		}
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

				&.underline {
					text-decoration: underline;
					color: #244851;
				}
			}

			.sample-id {
				font-size: 24rpx;
				color: #999;
				margin-left: 20rpx;
			}
		}

		.product-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
			margin-bottom: 24rpx;

			.tag {
				background: linear-gradient(135deg, #f8f9fa 0%, #eef2f5 100%);
				color: #244851;
				padding: 8rpx 16rpx;
				border-radius: 20rpx;
				font-size: 24rpx;
				line-height: 1.4;
				border: 1rpx solid rgba(58, 123, 255, 0.1);
				transition: all 0.2s ease;
			}
		}

		.card-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 24rpx;
			border-top: 1rpx solid #f0f0f0;
			gap: 16rpx;

			.status-badge {
				font-size: 24rpx;
				padding: 8rpx 20rpx;
				border-radius: 30rpx;
				font-weight: 500;
				flex-shrink: 0;
				transition: all 0.2s ease;

				&.status-info {
					background: linear-gradient(135deg, #f4f4f5 0%, #e9e9eb 100%);
					color: #919398;
					box-shadow: 0 2rpx 8rpx rgba(145, 147, 152, 0.1);
				}

				&.status-primary {
					background: linear-gradient(135deg, #eef5fe 0%, #e1edfd 100%);
					color: #3A7BFF;
					box-shadow: 0 2rpx 8rpx rgba(58, 123, 255, 0.1);
				}

				&.status-success {
					background: linear-gradient(135deg, #f2f9ec 0%, #e6f4dc 100%);
					color: #52c41a;
					box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.1);
				}

				&.status-warning {
					background: linear-gradient(135deg, #fcf6ed 0%, #f9efdd 100%);
					color: #faad14;
					box-shadow: 0 2rpx 8rpx rgba(250, 173, 20, 0.1);
				}

				&.status-error {
					background: linear-gradient(135deg, #fcf0f0 0%, #f9e2e2 100%);
					color: #ff4d4f;
					box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.1);
				}

				&.status-default {
					background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
					color: #606266;
					box-shadow: 0 2rpx 8rpx rgba(96, 98, 102, 0.1);
				}
			}

			.action-buttons {
				display: flex;
				gap: 20rpx;

				.action-btn {
					display: flex;
					align-items: center;
					gap: 8rpx;
					padding: 12rpx 20rpx;
					border-radius: 16rpx;
					font-size: 24rpx;
					font-weight: 500;
					transition: all 0.2s ease;

					&.preview-btn {
						background: rgba(58, 123, 255, 0.08);
						color: #244851;

						&:active {
							background: rgba(58, 123, 255, 0.15);
							transform: scale(0.95);
						}
					}

					&.download-btn {
						background: rgba(58, 123, 255, 0.08);
						color: #244851;

						&:active {
							background: rgba(58, 123, 255, 0.15);
							transform: scale(0.95);
						}
					}
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

	.card-details {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		margin-bottom: 24rpx;

		.detail-item {
			display: flex;
			align-items: center;

			.detail-label {
				font-size: 26rpx;
				color: #666;
				width: 134rpx;
				flex-shrink: 0;
			}

			.detail-value {
				font-size: 26rpx;
				color: #333;
				font-weight: 500;
				flex: 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	.search-adv {
		max-width: 700px;
		margin: 0 auto;
		padding: 20px;
		background: #f8fbfc;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(36, 72, 81, 0.12);
		font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
	}

	.search-adv .title {
		font-size: 20px;
		font-weight: 600;
		color: #244851;
		text-align: center;
		margin-bottom: 24px;
		position: relative;
		padding-bottom: 10px;
	}

	.search-adv .title::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 50px;
		height: 2px;
		background: #244851;
		border-radius: 1px;
	}

	.search-adv .search-title {
		font-size: 14px;
		font-weight: 600;
		color: #244851;
		margin-bottom: 6px;
		margin-top: 16px;
		display: flex;
		align-items: center;
	}

	.search-adv .search-title::before {
		content: '';
		display: inline-block;
		width: 3px;
		height: 12px;
		background: #244851;
		border-radius: 1px;
		margin-right: 6px;
	}

	.search-adv .search-content {
		margin-bottom: 12px;
	}

	/* 输入框样式 */
	.search-adv .tn-input,
	.search-adv .zxz-uni-data-select {
		width: 100%;
		height: 42px;
		border: 1.5px solid #d1e0e6;
		border-radius: 8px;
		padding: 0 14px;
		font-size: 14px;
		color: #2c3e50;
		background: #ffffff;
		transition: all 0.2s ease;
		box-shadow: 0 1px 4px rgba(36, 72, 81, 0.05);
	}

	.search-adv .tn-input::placeholder,
	.search-adv .zxz-uni-data-select::placeholder {
		color: #88a4ae;
		font-size: 13px;
	}

	.search-adv .tn-input:focus,
	.search-adv .zxz-uni-data-select:focus {
		border-color: #244851;
		box-shadow: 0 2px 8px rgba(36, 72, 81, 0.15);
		outline: none;
	}

	.search-adv .tn-input:hover,
	.search-adv .zxz-uni-data-select:hover {
		border-color: #88a4ae;
	}

	/* 禁用状态样式 */
	.search-adv .tn-input:disabled {
		background-color: #f1f7f9;
		color: #88a4ae;
		border-color: #e3edf0;
		cursor: not-allowed;
	}

	/* 按钮样式 */
	.search-adv .button-group {
		display: flex;
		gap: 15px;
		margin-top: 20px;
	}

	.search-adv .btn {
		height: 44px;
		border: none;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(36, 72, 81, 0.2);
		position: relative;
		overflow: hidden;
	}

	.search-adv .btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	.search-adv .btn:hover::before {
		left: 100%;
	}

	.search-adv .btn:hover {
		background: #1a363d;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(36, 72, 81, 0.3);
	}

	.search-adv .btn:active {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(36, 72, 81, 0.3);
	}

	.btn-search {
		flex: 2;
		/* 占2/3宽度 */
		background: #244851;
		color: white;
	}

	.btn-clear {
		flex: 1;
		/* 占1/3宽度 */
		background: #a0aec0;
		color: white;
	}

	.btn-search:hover {
		background: #1a363d;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(36, 72, 81, 0.3);
	}

	.btn-clear:hover {
		background: #8a9aad;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(160, 174, 192, 0.3);
	}

	/* 下拉选择器特殊样式 */
	.search-adv .zxz-uni-data-select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23244851' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		background-size: 14px;
		padding-right: 36px;
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.search-adv {
			padding: 16px;
			margin: 12px;
			border-radius: 10px;
		}

		.search-adv .title {
			font-size: 18px;
			margin-bottom: 20px;
		}

		.search-adv .search-title {
			margin-top: 14px;
		}

		.search-adv .tn-input,
		.search-adv .zxz-uni-data-select {
			height: 40px;
			font-size: 13px;
		}

		.search-adv .btn {
			height: 36px;
			font-size: 14px;
			margin-top: 8px;
		}

		.search-adv .button-group {
			gap: 10px;
		}
	}

	/* 紧凑布局调整 */
	.search-adv .search-title:first-of-type {
		margin-top: 0;
	}

	.ml10 {
		margin-left: 10px;
	}
</style>