<template>
	<view class="dialog-mask" v-if="visible" @tap="handleCancel">
		<view class="dialog-container" @tap.stop>
			<view class="dialog-title">{{title}}</view>
			<input class="dialog-input" v-model="inputValue" :placeholder="placeholder" />
			<view class="dialog-buttons">
				<button class="dialog-button cancel" @tap="handleCancel">{{cancelText}}</button>
				<button class="dialog-button confirm" @tap="handleConfirm">{{confirmText}}</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			visible: Boolean,
			title: {
				type: String,
				default: '请输入'
			},
			placeholder: {
				type: String,
				default: '请输入内容...'
			},
			confirmText: {
				type: String,
				default: '确认'
			},
			cancelText: {
				type: String,
				default: '取消'
			},
			defaultValue: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				inputValue: ''
			};
		},
		methods: {
			handleConfirm() {
				this.$emit('confirm', this.inputValue);
				this.$emit('update:visible', false);
			},
			handleCancel() {
				this.$emit('cancel');
				this.$emit('update:visible', false);
			}
		},
		watch: {
			defaultValue(newVal) {
				this.inputValue = newVal;
			}
		},
		watch: {
			visible(newVal) {
				// 当弹窗显示时清空输入框
				if (newVal) {
					this.inputValue = '';
				}
			}
		}
	};
</script>

<style scoped>
	.dialog-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
	}

	.dialog-container {
		width: 80%;
		background-color: #fff;
		border-radius: 10px;
		padding: 20px;
		box-sizing: border-box;
	}

	.dialog-title {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 15px;
		text-align: center;
	}

	.dialog-input {
		width: 100%;
		height: 40px;
		border: 1px solid #ddd;
		border-radius: 5px;
		padding: 0 10px;
		margin-top: 30px;
		margin-bottom: 30px;
		box-sizing: border-box;
	}

	.dialog-buttons {
		display: flex;
		justify-content: space-between;
	}

	.dialog-button {
		flex: 1;
		margin: 0 5px;
		height: 40px;
		line-height: 40px;
		border-radius: 5px;
	}

	.cancel {
		background-color: #f0f0f0;
		color: #333;
	}

	.confirm {
		background-color: #244851;
		color: #fff;
	}
</style>