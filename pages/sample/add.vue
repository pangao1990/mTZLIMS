<template>
	<tn-notify ref="refNotify" />
	<tn-modal ref="refModal" />
	<div class="bg">
		<!-- 顶部导航栏 -->
		<div class="nav">
			<div class="nav-side">
				<tn-icon :name="state.isBack2Home ? 'home' : 'left'" bold size="22px" custom-class="nav-back" @click="onBack" />
			</div>
			<span class="nav-title">{{state.isAdd ? '项目下单' : (state.isUse ? '样本信息': '编辑信息')}}</span>
			<div class="nav-side"></div>
		</div>

		<div class="form-container">
			<!-- 检测信息 -->
			<div class="form-section">
				<div class="section-title">
					检测信息
					<tn-button :disabled="state.isUse" @click="onSampleIdAdd" text :text-color="state.isUse ? '#BABABA' : '#244851'" font-size="30rpx">新增</tn-button>
				</div>
				<div :class="{'product-card-divider': index+1 < sampleInfo.sample_id_list.length}" v-for="(sample_id, index) in sampleInfo.sample_id_list" :key="sample_id">
					<div class="form-item">
						<div class="product-item-header">
							<div class="item-label required">条码号{{sampleInfo.sample_id_list.length > 1 ? index + 1 : ''}}</div>
							<tn-button v-if="index > 0" @click="onSampleIdRemove(index)" text :text-color="state.isUse ? '#BABABA' : '#FF4444'" font-size="28rpx">删除</tn-button>
						</div>
						<div class="hospital-control">
							<tn-input focus :disabled="state.isUse" v-model="sampleInfo.sample_id_list[index]" placeholder="请输入条码号" :clearable="!state.isUse" />
							<tn-bubble-box :disabled="state.isUse" :textColor="state.isUse ? '#BABABA' : '#244851'" :options="state.refreshOptions" @click="onRefresh">
								<view>API</view>
							</tn-bubble-box>
						</div>
					</div>
					<div class="form-item">
						<div class="item-label required">样本类型{{sampleInfo.sample_id_list.length > 1 ? index + 1 : ''}}</div>
						<zxz-uni-data-select :disabled="state.isUse" v-model="sampleInfo.sample_type_id_list[index]" :localdata="storeUserInfo.sampleTypeList" filterable
							placeholder="请选择样本类型" emptyTips="无数据"></zxz-uni-data-select>
					</div>
					<div class="form-item">
						<div class="item-label required">标本性状{{sampleInfo.sample_id_list.length > 1 ? index + 1 : ''}}</div>
						<zxz-uni-data-select :disabled="state.isUse" v-model="sampleInfo.sample_character_id_list[index]" :localdata="storeUserInfo.sampleCharacterList" filterable
							placeholder="请选择标本性状" emptyTips="无数据"></zxz-uni-data-select>
					</div>
					<div class="form-item">
						<div class="item-label required">检测项目{{sampleInfo.sample_id_list.length > 1 ? index + 1 : ''}}</div>
						<zxz-uni-data-select :disabled="state.isUse" v-model="sampleInfo.product_id_list[index]" :localdata="state.productInfoList" multiple filterable
							placeholder="请选择检测项目" emptyTips="无数据" @change="changeSelectProduct(index)"></zxz-uni-data-select>
						<!-- 最近检测项目 -->
						<div v-if="!state.isUse">
							<div v-if="state.recentProduct.length > 0" class="item-label mt10">最近录入的检测项目</div>
							<tn-tag @click="changeSelectRecentProduct(item.id, index)" v-for="item in state.recentProduct" :key="item.id"
								:bg-color="sampleInfo.product_id_list[index] && sampleInfo.product_id_list[index].includes(item.id) ? '': '#F5F5F5'"
								:text-color="sampleInfo.product_id_list[index] && sampleInfo.product_id_list[index].includes(item.id) ? '': '#7D7D7D'" type="info" shape="round"
								border border-color="#fff">{{item.name}}</tn-tag>
						</div>
					</div>
				</div>
			</div>

			<!-- 标本信息 -->
			<div class="form-section">
				<div class="section-title">标本信息</div>
				<div class="form-item">
					<div class="item-label required">采样时间</div>
					<uni-datetime-picker v-if="!state.isUse" :disabled="state.isUse" v-model="sampleInfo.collection_date" type="datetime" placeholder="请选择采样时间"
						:clearable="!state.isUse" />
					<tn-input v-else :disabled="state.isUse" v-model="sampleInfo.collection_date" placeholder="请输入采样时间" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label required">收样时间</div>
					<uni-datetime-picker v-if="!state.isUse" :disabled="state.isUse" v-model="sampleInfo.receive_date" type="datetime" placeholder="请选择收样时间"
						:clearable="!state.isUse" />
					<tn-input v-else :disabled="state.isUse" v-model="sampleInfo.receive_date" placeholder="请输入收样时间" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label required">销售端</div>
					<zxz-uni-data-select :disabled="state.isUse" v-model="state.client_type_id" :localdata="storeUserInfo.clientList" filterable placeholder="请选择销售端名称"
						emptyTips="无数据"></zxz-uni-data-select>
				</div>
				<div class="form-item">
					<div class="item-label">物流单号</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.tracking_number" placeholder="请输入物流单号" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label">备注信息</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.remark" type="textarea" placeholder="请输入备注信息" :clearable="!state.isUse" />
				</div>
			</div>

			<!-- 受检者信息 -->
			<div class="form-section">
				<div class="section-title">受检者信息</div>
				<div class="form-item">
					<div class="item-label required">受检者姓名</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.name" placeholder="请输入受检者姓名" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label">性别</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.gender" placeholder="请输入性别" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label">年龄</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.age" placeholder="请输入年龄" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label">联系方式</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.phone" placeholder="请输入联系方式" :clearable="!state.isUse" />
				</div>
			</div>

			<!-- 单位信息 -->
			<div class="form-section">
				<div class="section-title">单位信息</div>
				<div class="form-item">
					<div class="item-label required">送检单位</div>
					<div class="hospital-control">
						<zxz-uni-data-select :disabled="state.isUse" v-model="sampleInfo.hospital" :localdata="storeUserInfo.hospitalList" filterable placeholder="请选择送检单位"
							emptyTips="无数据" @inputChange="onHospitalChange"></zxz-uni-data-select>
						<tn-button :disabled="state.isUse" @click="onHospitalAdd" text :text-color="state.isUse ? '#BABABA' : '#244851'" font-size="30rpx">新增</tn-button>
					</div>
				</div>
				<div class="form-item">
					<div class="item-label">送检科室</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.office" placeholder="请输入送检科室" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label">送检医生</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.doctor" placeholder="请输入送检医生" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label">门诊/住院号</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.patient_id" placeholder="请输入门诊/住院号" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label">床号</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.bed_id" placeholder="请输入床号" :clearable="!state.isUse" />
				</div>
			</div>

			<!-- 临床信息 -->
			<div class="form-section">
				<div class="section-title">临床信息</div>
				<div class="form-item">
					<div class="item-label">临床诊断</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.diagnose" placeholder="请输入临床诊断" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label">临床表型</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.symptoms" placeholder="请输入临床表型" :clearable="!state.isUse" />
				</div>
				<div class="form-item">
					<div class="item-label">其他信息</div>
					<tn-input :disabled="state.isUse" v-model="sampleInfo.family_history" placeholder="请输入其他信息" :clearable="!state.isUse" />
				</div>
			</div>

			<!-- 附件 -->
			<div class="form-section" v-if="state.isAdd || state.attachments.length > 0">
				<div class="section-title required">
					<div>附件</div>
				</div>
				<div class="form-item">
					<tn-image-upload :disabled="state.isUse" v-model="state.attachments" :action="state.urlUpload" :custom-upload-handler="uploadHandle" @remove="uploadRemove"
						:max="9" :max-size="30 * 1024 * 1024" :extensions="['jpg', 'jpeg', 'png']" />
				</div>
			</div>

			<!-- 操作按钮 -->
			<div class="action-buttons">
				<tn-button v-if="state.isAdd" shape="round" shadow plain border-color="#244851" text-color="#244851" @click="onClear">清空</tn-button>
				<tn-button v-if="!state.isAdd && !state.isUse" shape="round" shadow plain border-color="#e83a30" text-color="#e83a30" @click="onDelete">删除</tn-button>
				<tn-button v-if="!state.isUse" shape="round" shadow bg-color="#244851" text-color="#fff" @click="onSubmit">确认</tn-button>
			</div>
		</div>
	</div>

	<!-- 登录 -->
	<Login :is_mask_click="false" />

	<!-- 送检单位 输入框 -->
	<Hospital :visible.sync="state.showDialogHospital" title="新增送检单位" placeholder="请输入送检单位" @confirm="handleConfirm" @cancel="handleCancel" />

	<!-- 匹配API -->
	<tn-popup v-model="state.matchVisible">
		<div class="match-card">
			<div class="card-header">匹配API-{{state.type_api}}</div>
			<div class="card-container">
				<div class="card-list" v-for="(item, index) in state.matchData" :key="index">
					<div class="card-list-title">分类：</div>
					<div class="card-list-content">{{item.api_key}}</div>
					<div class="card-list-title">API-编码：</div>
					<div class="card-list-content">{{item.api_val_id}}</div>
					<div class="card-list-title">API-名称：</div>
					<div class="card-list-content">{{item.api_val}}</div>
					<div class="card-list-title">LIMS-名称：</div>
					<zxz-uni-data-select v-if="item.api_key=='检测项目'" v-model="state.matchData[index]['lims_val_id']" :localdata="state.productInfoList" filterable
						placeholder="请选择检测项目" emptyTips="无数据"></zxz-uni-data-select>
					<zxz-uni-data-select v-if="item.api_key=='项目单项'" v-model="state.matchData[index]['lims_val_id']" :localdata="storeUserInfo.productBaseList" filterable
						placeholder="请选择项目单项" emptyTips="无数据"></zxz-uni-data-select>
					<zxz-uni-data-select v-if="item.api_key=='标本类型'" v-model="state.matchData[index]['lims_val_id']" :localdata="storeUserInfo.sampleTypeList" filterable
						placeholder="请选择样本类型" emptyTips="无数据"></zxz-uni-data-select>
					<zxz-uni-data-select v-if="item.api_key=='标本性状'" v-model="state.matchData[index]['lims_val_id']" :localdata="storeUserInfo.sampleCharacterList" filterable
						placeholder="请选择标本性状" emptyTips="无数据"></zxz-uni-data-select>

					<tn-button class="card-list-btn" shadow bg-color="#244851" text-color="#fff" @click="onMatchAdd(item, index)" width="60px">确认</tn-button>
				</div>
			</div>
		</div>
	</tn-popup>

</template>

<script setup>
	import Login from '/pages/login/index.vue'
	import Hospital from '/pages/sample/hospital.vue'

	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		onMounted,
		onUnmounted,
		watch
	} from 'vue'
	import {
		useStoreUserInfo
	} from '@/stores/userInfo'
	import {
		Local,
		StorageKey
	} from '@/utils/storage'
	import {
		apiProductGetListFromSort1,
		apiProductGetInfo
	} from '@/api/weixin'
	import {
		apiHospitalGetList,
		apiApplicationInfoAdd,
		apiApplicationInfoEdit,
		apiApplicationInfoGetInfo,
		apiApplicationInfoDelete,
		apiSampleTypeGetList,
		apiSampleCharacterGetList,
		apiClientGetList,
		apiApplicationInfoGetInfoForAPI,
		apiProductGetList,
		apiConfigMatchAPIAdd
	} from '@/api/sample'

	const storeUserInfo = useStoreUserInfo()

	const refNotify = ref()
	const refModal = ref()
	const state = reactive({
		isBack2Home: false,
		sample_info_id: '',
		isAdd: true, // 新增模式
		isUse: false, // 是否已经领用了
		selectProductIdList: [''],
		productInfoList: [], // 可选择的检测项目
		productInfoListExtra: [], // 理论上不可选择的检测项目，但这一次暂时可选择
		urlRoot: 'http://58.215.216.131:5555/', // http://127.0.0.1:8879/    http://58.215.216.131:5555/
		attachments: [],
		showDialogHospital: false,
		recentProduct: [],
		client_type_id: 'client0',
		refreshOptions: [{
				text: '优贝康',
			},
			{
				text: '常一',
			},
		],
		type_api: '优贝康',
		matchData: [],
		matchVisible: false
	})

	const sampleInfo = reactive({
		sample_id_list: [''],
		sample_type_id_list: [],
		sample_character_id_list: [],
		product_id_list: [],
		client_type: 'client',
		client_id: 0,
		collection_date: '',
		receive_date: '',
		name: '',
		gender: '',
		age: '',
		phone: '',
		hospital: '',
		office: '',
		doctor: '',
		patient_id: '',
		bed_id: '',
		diagnose: '',
		symptoms: '',
		family_history: '',
		remark: '',
		sell_id: parseInt(storeUserInfo.userInfos.id),
		sample_state: '接收中',
		tracking_number: '',
		addNameListAttachment: [],
		removeNameListAttachment: [],
		api_id: '',
		api_remark: {}
	})

	onLoad((option) => {
		if (option.sample_info_id != undefined) state.sample_info_id = parseInt(option.sample_info_id)
	})

	state.productInfoList = computed(() => {
		return [...new Set([...storeUserInfo.productInfoList, ...state.productInfoListExtra])]
	})
	state.isAdd = computed(() => {
		return state.sample_info_id == ''
	})
	state.isUse = computed(() => {
		return !['接收中'].includes(sampleInfo.sample_state)
	})

	onMounted(() => {
		if (storeUserInfo.productInfoList.length == 0) getProductList()
		if (storeUserInfo.sampleTypeList.length == 0) getSampletypeList()
		if (storeUserInfo.sampleCharacterList.length == 0) getSamplecharacterList()
		if (storeUserInfo.clientList.length == 0) getClientList()
		if (storeUserInfo.hospitalList.length == 0) getHospitalList()
		if (state.sample_info_id != '') getSampleInfo()

		const pages = getCurrentPages()
		state.isBack2Home = pages.length == 1
	})

	onUnmounted(() => {
		// console.log('unmounted')
		if (!state.isAdd) onClear()
	})

	// 返回上一页
	const onBack = () => {
		if (!state.isAdd) onClear()

		if (state.isBack2Home) uni.redirectTo({
			url: '/pages/index/index'
		})
		else uni.navigateBack()
	}

	const onSampleIdAdd = () => {
		sampleInfo.sample_id_list = [...sampleInfo.sample_id_list, '']
		sampleInfo.sample_type_id_list = [...sampleInfo.sample_type_id_list, '']
		sampleInfo.sample_character_id_list = [...sampleInfo.sample_character_id_list, '']
		sampleInfo.product_id_list = [...sampleInfo.product_id_list, []]
	}
	const onSampleIdRemove = (index) => {
		sampleInfo.sample_id_list.splice(index, 1)
		sampleInfo.sample_type_id_list.splice(index, 1)
		sampleInfo.sample_character_id_list.splice(index, 1)
		sampleInfo.product_id_list.splice(index, 1)
	}

	const getProductList = () => {
		const token = storeUserInfo.token
		const para = {
			'token': token
		}
		apiProductGetListFromSort1(para)
			.then((res) => {
				// console.log('res', res)
				const productInfoList = res.list.flatMap(item => item.list).map(item => ({
					value: item.product_id,
					text: item.name,
				}))
				storeUserInfo.setProductInfoList(productInfoList)
				// console.log('productInfoList', productInfoList)
				state.recentProduct = res.recentList
			})
	}
	const getSampletypeList = () => {
		const para = {
			size: 100
		}
		apiSampleTypeGetList(para)
			.then((res) => {
				// console.log('res', res)
				const sampleTypeList = res.list.map(item => ({
					value: item.id,
					text: item.name
				}))
				storeUserInfo.setSampleTypeList(sampleTypeList)
			})
	}
	const getSamplecharacterList = () => {
		const para = {
			size: 100
		}
		apiSampleCharacterGetList(para)
			.then((res) => {
				// console.log('res', res)
				const sampleCharacterList = res.list.map(item => ({
					value: item.id,
					text: item.name
				}))
				storeUserInfo.setSampleCharacterList(sampleCharacterList)
			})
	}
	const getClientList = () => {
		const para = {
			type: 'clientAndManager',
			size: 10000,
			search: {
				usable: true
			}
		}
		apiClientGetList(para)
			.then((res) => {
				// console.log('res', res)
				const clientList = res.list.map(item => ({
					value: item.uid,
					text: item.name,
					id: item.id,
					client_type: item.client_type,
					hospital: item.hospital
				}))
				storeUserInfo.setClientList(clientList)
			})
	}
	const getHospitalList = () => {
		const para = {
			userId: storeUserInfo.userInfos.id
		}
		apiHospitalGetList(para)
			.then((res) => {
				// console.log('res', res)
				let hospitalList = []
				for (const item of res.list) {
					if (hospitalList.indexOf(item.hospital) == -1) {
						hospitalList.push(item.hospital)
					}
				}
				hospitalList = hospitalList.map((item) => {
					return {
						value: item,
						text: item
					}
				})
				// 添加一个默认值-
				hospitalList = [{
					value: '-',
					text: '-'
				}, ...hospitalList]
				storeUserInfo.setHospitalList(hospitalList)
			})
	}
	const getProductBaseList = () => {
		const para = {
			type: 'neuroimmuneBase',
			size: 1000,
			search: {
				usable: true
			}
		}
		apiProductGetList(para)
			.then((res) => {
				// console.log('res', res)
				const productBaseList = res.list.map(item => ({
					value: item.id,
					text: item.name,
				}))
				storeUserInfo.setProductBaseList(productBaseList)
			})
	}

	const onHospitalChange = (e) => {
		console.log('onHospitalChange', e)
	}
	const onHospitalAdd = () => {
		// console.log('onHospitalAdd')
		state.showDialogHospital = true
	}
	const handleConfirm = (hospital) => {
		// console.log('handleConfirm', hospital)
		// 更新本地
		let hospitalList = storeUserInfo.hospitalList
		hospitalList = [{
			value: hospital,
			text: hospital
		}, ...hospitalList]
		storeUserInfo.setHospitalList(hospitalList)
		sampleInfo.hospital = hospital
		state.showDialogHospital = false
	}
	const handleCancel = () => {
		// console.log('取消输入')
		state.showDialogHospital = false
	}

	const changeSelectProduct = (index) => {
		if (index == 0 && sampleInfo.product_id_list.length > 0) {
			storeUserInfo.setSelectedProductIds(sampleInfo.product_id_list[0])
		}
	}

	const changeSelectRecentProduct = (id, index) => {
		if (!sampleInfo.product_id_list[index]) sampleInfo.product_id_list[index] = []
		if (sampleInfo.product_id_list[index].includes(id)) sampleInfo.product_id_list[index] = sampleInfo.product_id_list[index].filter(
			item => item !== id)
		else sampleInfo.product_id_list[index].push(id)
		changeSelectProduct(index)
	}

	const onMatchAdd = (item, index) => {
		// console.log('onMatchAdd', item, index)

		uni.showLoading({
			title: '确认中'
		})
		const para = {
			'info': item
		}
		apiConfigMatchAPIAdd(para)
			.then((res) => {
				// console.log('res', res)
				const code = res.code
				switch (code) {
					case 0:
						refNotify.value.show({
							msg: '新增成功',
							type: 'success'
						})
						state.matchData.splice(index, 1)
						break
					case 1:
						// 已存在
						refNotify.value.show({
							msg: '该匹配API已存在',
							type: 'warning'
						})
						break
					default:
						// 未知错误
						refNotify.value.show({
							msg: '未知错误 => ' + res.msg,
							type: 'warning'
						})
				}
				uni.hideLoading()
			}).catch(() => {
				uni.hideLoading()
			})
	}

	// 第三方API匹配
	const onRefresh = (index) => {
		// console.log(index)
		if (sampleInfo.sample_id_list[0] == '') {
			refNotify.value.show({
				msg: '请输入条码号',
				type: 'warning'
			})
		} else {
			if (index == 0) state.type_api = '优贝康'
			else if (index == 1) state.type_api = '常一'
			getRefresh()
		}
	}
	const getRefresh = () => {
		uni.showLoading({
			title: '加载中'
		})
		const para = {
			'sample_id': sampleInfo.sample_id_list[0],
			'type': state.type_api
		}
		apiApplicationInfoGetInfoForAPI(para)
			.then((res) => {
				// console.log('res', res)
				const code = res.code
				switch (code) {
					case 0:
						sampleInfo['sample_id_list'] = [res.info.sample_id]
						sampleInfo['sample_type_id_list'] = [res.info.sampleType[0].id]
						sampleInfo['sample_character_id_list'] = [res.info.sampleCharacter[0].id]
						sampleInfo['client_type'] = 'client'
						sampleInfo['client_id'] = res.info.client_id
						state.client_type_id = sampleInfo['client_type'] + sampleInfo['client_id']
						sampleInfo['collection_date'] = res.info.collection_date
						sampleInfo['receive_date'] = res.info.receive_date
						sampleInfo['name'] = res.info.name
						sampleInfo['gender'] = res.info.gender
						sampleInfo['age'] = res.info.age
						sampleInfo['phone'] = res.info.phone
						sampleInfo['hospital'] = res.info.hospital
						let isHave = false
						let hospitalList = storeUserInfo.hospitalList
						for (const item of hospitalList) {
							if (item.text == sampleInfo['hospital']) {
								isHave = true
								break
							}
						}
						if (!isHave) {
							// 添加一个自定义的内容
							hospitalList = [{
								value: sampleInfo['hospital'],
								text: sampleInfo['hospital']
							}, ...hospitalList]
							storeUserInfo.setHospitalList(hospitalList)
						}
						sampleInfo['office'] = res.info.office
						sampleInfo['doctor'] = res.info.doctor
						sampleInfo['patient_id'] = res.info.patient_id
						sampleInfo['bed_id'] = res.info.bed_id
						sampleInfo['diagnose'] = res.info.diagnose
						sampleInfo['symptoms'] = res.info.symptoms
						sampleInfo['family_history'] = res.info.family_history
						sampleInfo['tracking_number'] = ''
						sampleInfo['remark'] = res.info.remark
						sampleInfo['sell_id'] = parseInt(storeUserInfo.userInfos.id)
						sampleInfo['api_id'] = res.info.api_id
						sampleInfo['api_remark'] = res.info.api_remark
						state.attachments = res.files.map((item) => {
							return item.url
						})
						sampleInfo['addNameListAttachment'] = res.files.map((item) => {
							return item['name']
						})
						sampleInfo['removeNameListAttachment'] = []
						let selectProductIdList = []
						for (let productItem of res.info.product) {
							let productId = productItem['id']
							selectProductIdList.push(productId)
							// 如果是不能选择的检测项目，也让用户暂时可以选择
							state.productInfoListExtra.push({
								value: productItem['id'],
								text: productItem['name']
							})
						}
						sampleInfo['product_id_list'] = [selectProductIdList]
						storeUserInfo.setSelectedProductIds(selectProductIdList)
						break
					case -1:
						// 访问远程API失败
						refNotify.value.show({
							msg: '访问远程API失败 => ' + res.msg,
							type: 'error'
						})
						break
					case 1:
						// 远程API返回非200
						refNotify.value.show({
							msg: '远程API返回信息 => ' + res.msg,
							type: 'error'
						})
						break
					case 2:
						// 返回数据resultObject为[]
						refNotify.value.show({
							msg: res.msg,
							type: 'error'
						})
						break
					case 3:
						// 请匹配API数据
						refNotify.value.show({
							msg: res.msg,
							type: 'error'
						})
						state.matchData = res.info.map((item) => {
							item['api_user'] = state.type_api
							item['lims_val_id'] = ''
							item['remark'] = ''
							return item
						})
						state.matchVisible = true
						if (storeUserInfo.productBaseList.length == 0) getProductBaseList()
						break
					default:
						// 未知错误
						refNotify.value.show({
							msg: '未知错误 => ' + res.msg,
							type: 'warning'
						})
				}
				uni.hideLoading()
			}).catch(() => {
				uni.hideLoading()
			})
	}

	// 提交申请
	const onSubmit = () => {
		const length = sampleInfo.sample_id_list.length
		for (let index in sampleInfo.sample_id_list) {
			let num = ''
			if (length > 1) num = Number(index) + 1
			if (sampleInfo.sample_id_list[index] == '') {
				refNotify.value.show({
					msg: `条码号${num}为必填项`,
					type: 'warning'
				})
				return
			}

			if (sampleInfo.sample_type_id_list.length == 0 || sampleInfo.sample_type_id_list[index] == '') {
				refNotify.value.show({
					msg: `样本类型${num}为必填项`,
					type: 'warning'
				})
				return
			}

			if (sampleInfo.sample_character_id_list.length == 0 || sampleInfo.sample_character_id_list[index] === '') {
				refNotify.value.show({
					msg: `标本性状${num}为必填项`,
					type: 'warning'
				})
				return
			}

			if (sampleInfo.product_id_list.length == 0 || sampleInfo.product_id_list[index].length == 0) {
				refNotify.value.show({
					msg: `检测项目${num}为必填项`,
					type: 'warning'
				})
				return
			}
		}

		if (sampleInfo.collection_date == '') {
			refNotify.value.show({
				msg: '采样时间为必填项',
				type: 'warning'
			})
			return
		}

		if (sampleInfo.receive_date == '') {
			refNotify.value.show({
				msg: '收样时间为必填项',
				type: 'warning'
			})
			return
		}

		if (sampleInfo.name == '') {
			refNotify.value.show({
				msg: '受检者姓名为必填项',
				type: 'warning'
			})
			return
		}

		if (sampleInfo.hospital == '') {
			refNotify.value.show({
				msg: '送检单位为必填项',
				type: 'warning'
			})
			return
		}

		let info = JSON.parse(JSON.stringify(sampleInfo))
		if (info['sample_state'] == '接收中') delete info['sample_state']

		// console.log('info', info)
		if (state.isAdd) postAdd(info)
		else postEdit(info)
	}

	const postAdd = (info, force = false) => {
		const para = {
			'info': info,
			'force': force
		}
		// console.log('para', para)
		apiApplicationInfoAdd(para)
			.then((res) => {
				// console.log('res', res)
				const code = res.code
				switch (code) {
					case 0:
						// 新增成功
						refNotify.value.show({
							msg: '新增成功',
							type: 'success'
						})
						onClear() // 清空
						// 更新近期检测项目
						getProductList()
						break
					case 1:
						// 已存在
						refModal.value.showModal({
							title: '',
							content: `条码号 ${res.sampleId} 已存在，请修改！`,
							showCancel: false,
							confirmText: '确定',
							confirm: () => {
								// console.log('点击了确认按钮')
							},
						})
						break
					case -1:
						// 附件上传失败
						refNotify.value.show({
							msg: '附件上传失败',
							type: 'warning'
						})
						break
					default:
						// 未知错误
						refNotify.value.show({
							msg: '未知错误',
							type: 'warning'
						})
				}
			}).catch(() => {
				refNotify.value.show({
					msg: '未知错误',
					type: 'warning'
				})
			})
	}

	const postEdit = (info) => {
		info['sample_info_id'] = state.sample_info_id
		const para = {
			'info': info
		}
		apiApplicationInfoEdit(para)
			.then((res) => {
				// console.log('res', res)
				const code = res.code
				switch (code) {
					case 0:
						// 编辑成功
						refNotify.value.show({
							msg: '编辑成功',
							type: 'success'
						})
						// router.push({
						// 	path: '/application/List',
						// 	query: {
						// 		time: new Date().getTime()
						// 	}
						// })
						break
					case -1:
						// 未知检测项目
						refNotify.value.show({
							msg: '未知检测项目',
							type: 'error'
						})
						break
					case -2:
						// 附件上传失败
						refNotify.value.show({
							msg: '附件上传失败',
							type: 'warning'
						})
						break
					default:
						// 未知错误
						refNotify.value.show({
							msg: '未知错误',
							type: 'warning'
						})
				}
			}).catch(() => {
				refNotify.value.show({
					msg: '未知错误',
					type: 'warning'
				})
			})
	}

	const getSampleInfo = () => {
		uni.showLoading({
			title: '加载中'
		})
		const para = {
			'id': state.sample_info_id
		}
		apiApplicationInfoGetInfo(para)
			.then((res) => {
				// console.log('res', res)
				const code = res.code
				switch (code) {
					case 0:
						sampleInfo['sample_id_list'] = [res.info.sample_id]
						sampleInfo['sample_type_id_list'] = [res.info.sampleType.id]
						sampleInfo['sample_character_id_list'] = [res.info.sampleCharacter.id]
						sampleInfo['client_type'] = res.info.client_type
						sampleInfo['client_id'] = res.info.client.id
						state.client_type_id = sampleInfo['client_type'] + sampleInfo['client_id']
						sampleInfo['collection_date'] = res.info.collection_date
						sampleInfo['receive_date'] = res.info.receive_date
						sampleInfo['name'] = res.info.name
						sampleInfo['gender'] = res.info.gender
						sampleInfo['age'] = res.info.age
						sampleInfo['phone'] = res.info.phone
						sampleInfo['hospital'] = res.info.hospital
						let isHave = false
						let hospitalList = storeUserInfo.hospitalList
						for (const item of hospitalList) {
							if (item.text == sampleInfo['hospital']) {
								isHave = true
								break
							}
						}
						if (!isHave) {
							// 添加一个自定义的内容
							hospitalList = [{
								value: sampleInfo['hospital'],
								text: sampleInfo['hospital']
							}, ...hospitalList]
							storeUserInfo.setHospitalList(hospitalList)
						}
						sampleInfo['office'] = res.info.office
						sampleInfo['doctor'] = res.info.doctor
						sampleInfo['patient_id'] = res.info.patient_id
						sampleInfo['bed_id'] = res.info.bed_id
						sampleInfo['diagnose'] = res.info.diagnose
						sampleInfo['symptoms'] = res.info.symptoms
						sampleInfo['family_history'] = res.info.family_history
						sampleInfo['tracking_number'] = res.info.tracking_number
						sampleInfo['remark'] = res.info.remark
						sampleInfo['sell_id'] = res.info.sell.id
						sampleInfo['api_id'] = res.info.api_id
						sampleInfo['api_remark'] = res.info.api_remark
						sampleInfo['sample_state'] = res.info.sample_state
						sampleInfo['addNameListAttachment'] = []
						sampleInfo['removeNameListAttachment'] = []
						let selectProductIdList = []
						for (let productItem of res.info.product) {
							let productId = productItem['id']
							selectProductIdList.push(productId)
							// 如果是不能选择的检测项目，也让用户暂时可以选择
							state.productInfoListExtra.push({
								value: productItem['id'],
								text: productItem['name']
							})
						}
						sampleInfo['product_id_list'] = [selectProductIdList]
						storeUserInfo.setSelectedProductIds(selectProductIdList)
						state.attachments = res.info.attachment.map((item) => {
							return item.url
						})
						break
					case 1:
						// 无相关信息
						refNotify.value.show({
							msg: '未找到相关信息',
							type: 'warning'
						})
						break
					case -1:
						// 未知检测项目
						refNotify.value.show({
							msg: '未知检测项目',
							type: 'error'
						})
						break
					default:
						// 未知错误
						refNotify.value.show({
							msg: '未知错误',
							type: 'warning'
						})
				}
				uni.hideLoading()
			}).catch(() => {
				uni.hideLoading()
			})
	}

	const onDelete = () => {
		refModal.value.showModal({
			title: '',
			content: '是否删除样本信息?',
			showCancel: true,
			confirmText: '删除',
			cancelText: '取消',
			confirmStyle: {
				color: 'tn-red',
			},
			cancelStyle: {
				color: 'tn-grey',
			},
			cancel: () => {
				// console.log('点击了取消按钮')
			},
			confirm: () => {
				// console.log('点击了确认按钮')
				apiDelete()
			},
		})

	}
	const apiDelete = () => {
		const para = {
			'id': state.sample_info_id
		}
		apiApplicationInfoDelete(para)
			.then((res) => {
				// console.log('res', res)
				const code = res.code
				switch (code) {
					case 0:
						// 删除成功
						refNotify.value.show({
							msg: '删除成功',
							type: 'success'
						})
						onClear() // 清空
						uni.navigateBack()
						// uni.redirectTo({
						// 	url: '/pages/sample/list'
						// })
						break
					case -1:
						// 未知检测项目
						refNotify.value.show({
							msg: '未知检测项目',
							type: 'error'
						})
						break
					default:
						// 未知错误
						refNotify.value.show({
							msg: '未知错误',
							type: 'warning'
						})
				}
			}).catch(() => {
				refNotify.value.show({
					msg: '未知错误',
					type: 'warning'
				})
			})
	}

	// 清空
	const onClear = () => {
		storeUserInfo.setSelectedProductIds([])

		state['sample_info_id'] = ''
		state['attachments'] = []
		state['productInfoListExtra'] = []
		state['client_type_id'] = 'client0'

		sampleInfo['sample_id_list'] = ['']
		sampleInfo['sample_type_id_list'] = []
		sampleInfo['sample_character_id_list'] = []
		sampleInfo['product_id_list'] = []
		sampleInfo['client_type'] = 'client'
		sampleInfo['client_id'] = 0
		sampleInfo['collection_date'] = ''
		sampleInfo['receive_date'] = ''
		sampleInfo['name'] = ''
		sampleInfo['gender'] = '未知'
		sampleInfo['phone'] = ''
		sampleInfo['hospital'] = ''
		sampleInfo['office'] = ''
		sampleInfo['doctor'] = ''
		sampleInfo['patient_id'] = ''
		sampleInfo['bed_id'] = ''
		sampleInfo['diagnose'] = ''
		sampleInfo['symptoms'] = ''
		sampleInfo['family_history'] = ''
		sampleInfo['remark'] = ''
		sampleInfo['sell_id'] = parseInt(storeUserInfo.userInfos.id)
		sampleInfo['sample_state'] = '接收中'
		sampleInfo['tracking_number'] = ''
		sampleInfo['addNameListAttachment'] = []
		sampleInfo['removeNameListAttachment'] = []
		sampleInfo['api_id'] = ''
		sampleInfo['api_remark'] = {}
	}

	// 上传图片
	const uploadHandle = (file) => {
		return new Promise((resolve, reject) => {
			let a = uni.uploadFile({
				url: state.urlRoot + 'api/upload/add_sample_info_img',
				filePath: file.path,
				name: 'file',
				formData: {
					token: storeUserInfo.token
				},
				success: (res) => {
					const resData = JSON.parse(res.data)
					// console.log('resData', resData)
					sampleInfo.addNameListAttachment.push(resData.imgName)
					const url = state.urlRoot + 'cache/' + resData.imgName
					// console.log('url', url)
					resolve(url)
				},
				fail: (err) => {
					reject(err)
				}
			})
		})
	}
	// 删除图片
	const uploadRemove = (url) => {
		// console.log('url', url)
		const imgName = url.replace(state.urlRoot + 'cache/', '')
		let index = sampleInfo.addNameListAttachment.indexOf(imgName)
		if (index !== -1) sampleInfo.addNameListAttachment.splice(index, 1)
		else sampleInfo.removeNameListAttachment.push(imgName)
	}

	watch(
		() => state.client_type_id,
		(client_type_id) => {
			// console.log('client_type_id', client_type_id)
			if (client_type_id.startsWith('client')) {
				sampleInfo.client_type = 'client'
				sampleInfo.client_id = Number(client_type_id.slice(6))
			} else if (client_type_id.startsWith('manager')) {
				sampleInfo.client_type = 'manager'
				sampleInfo.client_id = Number(client_type_id.slice(7))
			}
			// console.log('sampleInfo.client_type', sampleInfo.client_type)
			// console.log('sampleInfo.client_id', sampleInfo.client_id)

			for (const clientItem of storeUserInfo.clientList) {
				if (clientItem.value == client_type_id) {
					let hospitalList = clientItem.hospital.map((item) => {
						return {
							value: item,
							text: item
						}
					})
					hospitalList = [{
						value: '-',
						text: '-'
					}, ...hospitalList]
					storeUserInfo.setHospitalList(hospitalList)
					break
				}
			}
			// console.log('hospitalList', storeUserInfo.hospitalList)
		})

	watch(
		() => storeUserInfo.selectedProductIds,
		(selectedProductIds) => {
			// console.log('selectedProductIds', selectedProductIds)
			if (selectedProductIds.length == 0) {
				state.selectProductIdList = ['']
				sampleInfo['product_id_list'] = []
			} else {
				state.selectProductIdList = selectedProductIds
				sampleInfo['product_id_list'] = [selectedProductIds]
			}
		}, {
			immediate: true,
			deep: true
		}
	)

	watch(
		() => storeUserInfo.isReLoad,
		(isReLoad) => {
			if (isReLoad) {
				if (state.sample_info_id != '') getSampleInfo()
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

	.form-container {
		padding: 30rpx;
	}

	.form-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 30rpx;
		position: relative;
		padding-left: 20rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 8rpx;
			height: 32rpx;
			background-color: #244851;
			border-radius: 4rpx;
		}

		.required {
			color: #FF4444;
			margin-left: 8rpx;
		}
	}

	.form-item {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.item-label {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 16rpx;

		&.required::after {
			content: '*';
			color: #FF4444;
			margin-left: 8rpx;
		}
	}

	.action-buttons {
		display: flex;
		justify-content: space-between;
		padding: 0 30rpx;
		margin-top: 40rpx;

		.tn-button {
			width: 48%;
			height: 80rpx;
			font-size: 32rpx;
		}
	}

	.product-card-divider {
		margin-bottom: 30px;
		padding-bottom: 30px;
		border-bottom: 1px solid #EBEBEB;
	}

	.product-item-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.age-input-group {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
	}

	.age-input {
		flex: 1;
		min-width: 0;
	}

	.age-unit {
		margin: 0 16rpx 0 8rpx;
		white-space: nowrap;
	}

	/* 最后一个单位右边不加间距 */
	.age-unit:last-child {
		margin-right: 0;
	}

	.hospital-control {
		display: flex;
		align-items: center;
		gap: 16rpx;
		width: 100%;

		zxz-uni-data-select {
			flex: 1;
			min-width: 0;
		}

		tn-button {
			flex-shrink: 0;
		}
	}

	.mt10 {
		margin-top: 10px;
	}

	.match-card {
		width: 80vw;
		max-width: 1000px;
		max-height: 84vh;
		background: white;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: 20px;

		.card-header {
			font-size: 18px;
			font-weight: 600;
			color: #244851;
			margin-bottom: 20px;
			position: relative;
			padding-left: 20px;
			display: flex;
			align-items: center;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 6px;
				height: 14px;
				background-color: #244851;
				border-radius: 4px;
			}
		}

		.card-container {
			overflow-y: auto;
			padding: 0;
			flex-grow: 1;
		}

		/* 自定义滚动条样式 */
		.card-container::-webkit-scrollbar {
			width: 8px;
		}

		.card-container::-webkit-scrollbar-track {
			background: #f1f1f1;
			border-radius: 4px;
		}

		.card-container::-webkit-scrollbar-thumb {
			background: linear-gradient(135deg, #244851 0%, #3a6d7a 100%);
			border-radius: 4px;
		}

		.card-container::-webkit-scrollbar-thumb:hover {
			background: linear-gradient(135deg, #1a363c 0%, #2d5863 100%);
		}

		.card-list {
			padding: 16px 18px;
			border-bottom: 1px solid #eef2f7;
			transition: all 0.3s ease;
			cursor: pointer;
			display: grid;
			grid-template-columns: 100px 1fr;
			gap: 10px 14px;
			align-items: center;
			border-radius: 12px;
			margin-bottom: 12px;
			background: #ffffff;
			box-shadow: 0 2px 8px rgba(36, 72, 81, 0.05);
		}

		.card-list:hover {
			background-color: #f8fafc;
			transform: translateY(-2px);
			box-shadow: 0 6px 16px rgba(36, 72, 81, 0.1);
		}

		.card-list:last-child {
			border-bottom: none;
			margin-bottom: 0;
		}

		.card-list-title {
			font-weight: 600;
			color: #4a5568;
			display: flex;
			align-items: center;
			font-size: 14px;
		}

		.card-list-content {
			color: #2d3748;
			padding: 8px 12px;
			background: #f7fafc;
			border-radius: 8px;
			border-left: 3px solid #244851;
			font-size: 14px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.card-list-btn {
			justify-self: end;
		}

		/* 响应式设计 */
		@media (max-width: 768px) {
			.match-card {
				width: 95vw;
				padding: 15px;
			}

			.card-list {
				grid-template-columns: 1fr;
				gap: 8px;
			}

			.card-list-title,
			.card-list-content {
				grid-column: 1;
			}
		}
	}
</style>