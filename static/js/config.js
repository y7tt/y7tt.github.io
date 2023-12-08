import base from "./baseUrl.js";
import http from "./http.js"

var configval = {
	base_imageurl : base.baseUrl,
	/**
	 * 获取个人信息
	 * @param {Function}  resolve 回调
	 */
	async getMyInfoHttp(resolve) {
		const res = await http({
			url: "/user/info/show",
			method: "get",
		}, false)
		getApp().globalData.userData = res.data
		uni.setStorageSync('userData', res.data)
		return resolve && resolve(res.data)
	},
	/**
	 * 获取基础配置信息
	 * @param {Function}  resolve 回调
	 */
	async getConfigHttp(resolve) {
		const res = await http({
			url: "/site/data/config",
			method:"get"
		})
		return resolve && resolve(res.data)
	},
	
	tologin() {
		uni.navigateTo({
			url: '/pages/login/login'
		})
	},
	/**
	 * 跳转到指定页面url
	 * 支持tabBar页面
	 * @param {string}  url   页面路径
	 * @param {object}  query 页面参数
	 * @param {string}  modo  跳转类型(默认navigateTo)
	 */
	navTo(url, query = {}, mode = 'navigateTo') {
		if (!url || url.length == 0) {
			return false
		}
		let arr = ["pages/index/index","pages/news/news","pages/order/order","pages/my/my"]
		// tabBar页面, 使用switchTab
		if (this.inArray(url, arr)) {
			uni.switchTab({
				url: `/${url}`
			})
			return true
		}
		
		// 生成query参数
		const querySrc = !this.isEmpty(query) ? `?${this.urlEncode(query)}` : ''
		console.log(querySrc);
		// 普通页面跳转，使用navigateTo
		mode === 'navigateTo' && uni.navigateTo({
			url: `/${url}${querySrc}`
		})
		// 特殊指定，使用redirectTo
		mode === 'redirectTo' && uni.redirectTo({
			url: `/${url}${querySrc}`
		})
	},
	
	/**
	 * 倒计时方法，可用作手机验证码的倒计时
	 * @param {*} e 传this
	 * @param {Number} duration 倒计时的时长(秒数)
	 * @param {String} timeParam 需要倒计时的参数名字
	 * @param {Function} callBack 倒计时结束函数回调
	 */
	countDown(e, duration, timeParam, callBack) {
		if (!e.countDown_interval) {
			e[`${timeParam}`] = duration--
			e.countDown_interval = setInterval(() => {
				e[`${timeParam}`] = duration--
				if (duration == 0) {
					setTimeout(() => {
						clearInterval(e.countDown_interval)
						e.countDown_interval = null
						e[`${timeParam}`] = null
						callBack && callBack()
					}, 1000);
				}
			}, 1000)
		} else {
			return
		}
	},
	/**
	 * 支付倒计时，可用作待支付订单剩余支付时间
	 * @param {*} e 传this
	 * @param {Number} duration 倒计时的时长(秒数)
	 * @param {String} timeParam 需要倒计时的参数名字
	 * @param {Function} callBack 倒计时结束函数回调
	 */
	countDownOrder(e, duration, timeParam, callBack) {
		function formattime(lefttime) {
			var leftd = Math.floor(lefttime / (60 * 60 * 24)), //计算天数
				lefth = Math.floor(lefttime / (60 * 60) % 24), //计算小时数
				leftm = Math.floor((lefttime % 3600) / 60), //计算分钟数
				lefts = Math.floor((lefttime % 3600) % 60); //计算秒数
			let arr = ''
			if (Number(leftd) > 0) {
				arr = leftd + "天"
			}
			if (Number(lefth) > 0) {
				arr = arr + lefth + ":"
			}
			if (Number(leftm) > 0) {
				arr = arr + leftm + ":"
			}
			return arr + lefts; //返回倒计时的字符串
		}
		if (!e.countDown_interval) {
			let str = duration--
			e[`${timeParam}`] = formattime(str)
			e.countDown_interval = setInterval(() => {
				let str = duration--
				e[`${timeParam}`] = formattime(str)
				if (duration == 0) {
					setTimeout(() => {
						clearInterval(e.countDown_interval)
						e.countDown_interval = null
						e[`${timeParam}`] = null
						callBack && callBack()
					}, 1000);
				}
			}, 1000)
		} else {
			return
		}
	},
	/**
	 * 处理富文本图片自适应屏幕宽度
	 * @param {String} html 富文本
	 */
	formatRichText(html) {
		if ((html || '') == '') {return ""};
		let newContent = html.replace(/<img[^>]*>/gi, function(match, capture) {
			match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');
			match = match.replace(/width="[^"]+"/gi, '').replace(/width='[^']+'/gi, '');
			match = match.replace(/height="[^"]+"/gi, '').replace(/height='[^']+'/gi, '');
			return match;
		});
		newContent = newContent.replace(/style="[^"]+"/gi, function(match, capture) {
			match = match.replace(/width:[^;]+;/gi, 'max-width:100%;').replace(/width:[^;]+;/gi,
				'max-width:100%;');
			return match;
		});
		newContent = newContent.replace(/<br[^>]*\/>/gi, '');
		newContent = newContent.replace(/\<img/gi,
			'<img style="max-width:100%;height:auto;display:block;margin-top:0;margin-bottom:0;"');
		return newContent;
	},
	/**
	 * 上传图片
	 * @param {String} file 图片路径
	 */
	uploadimage(file) {
		let images = ''
		let imginfos = []
		uni.showLoading({title: "上传中..."})
		const token = uni.getStorageSync('token') || ''
		return new Promise(function(resolve, reject) {
			uni.uploadFile({
				url: base.baseUrl + '/site/upload/image',
				filePath: file, //要上传文件资源的路径
				name: 'image', //必须填file
				formData: {
					'success_action_status': '200'
				},
				success: function (res) {
					if (res.statusCode == 200) {
						let data = JSON.parse(res.data)
						let imagurl = data.data[0]
						imginfos.push({
							'fileID': imagurl,
							'url': imagurl
						})
						var arr = []
						for (let s of imginfos) {
							arr.push(s.url)
						}
						images = arr.join(",")
						let dic = {
							'imginfos': imginfos,
							'images': images
						}
						resolve(dic)
					} else {
						uni.showToast({
							icon: "none",
							title: (res.errMsg)
						})
					}
				},
				fail: function (err) {reject(err)},
				complete() {uni.hideLoading()}
			})
		}).catch((error) => {
			console.error(error);
		})
	},
	//时间格式化处理
	dateFormat(time) {
		let date = new Date(time);
		let year = date.getFullYear();
		// 在日期格式中，月份是从0开始的，因此要加0，使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
		let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
		let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
		let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
		let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
		let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
		// 拼接
		// return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
		return year + "-" + month + "-" + day;
	},
	/**
	 * Toast
	 * @param { String } text 提示内容
	 * @example this.$config.showToast('13311112222');
	 */
	showToast(text) {
		uni.showToast({
			title: text,
			icon: "none"
		})
	},
	/**
	 * 从底部向上弹出操作菜单
	 * @param { String } title 标题
	 * @param { String } content 内容
	 * @param { Boolean } showCancel 是否显示取消
	 * @param { Function } success 回调选择按钮的索引
	 * @example this.$config.showModal(null,'', false,() => console.log(index));
	 */
	showModal(title = null, content = "", showCancel = true, success) {
		uni.showModal({
			showCancel: showCancel,
			title: title || '温馨提示',
			content: content,
			confirmText: "确定",
			cancelText: "取消",
			success(res) {
				if (res.confirm) {
					success && success()
				}
			}
		})
	},
	/**
	 * 拨打电话
	 * @param { String } phoneNumber 目标号码
	 * @example this.$config.makePhone(13311112222);
	 */
	makePhone(phoneNumber) {
		uni.makePhoneCall({
			phoneNumber:phoneNumber
		});
	},
	/**
	 * 从底部向上弹出操作菜单
	 * @param { Array } itemList 按钮的文字数组
	 * @param { Function } callback 回调选择按钮的索引
	 * @param { String } textColor 按钮的文字颜色
	 * @example this.$config.showActionSheet(['A','B','C'],index => console.log(index));
	 */
	showActionSheet(itemList = [], textColor = "#4F4F4F", callback) {
		uni.showActionSheet({
			itemList:itemList,
			itemColor:textColor,
			success(res) {
				callback && callback(res.tapIndex);
			}
		})
	},
	
	/**
	 * 手机号加密
	 * @param {tel} tel 手机号
	 */
	geTel(tel) {
		var reg = /^(\d{3})\d{4}(\d{4})$/;
		return tel.replace(reg, "$1****$2");
	},
	
	/**
	 * 判断是否为空对象
	 * @param {*} object 源对象
	 */
	isEmptyObject(object) {
		return Object.keys(object).length === 0
	},
	
	/**
	 * 判断是否为数组
	 *@param {*} array
	 */
	isArray(array) {
		return Object.prototype.toString.call(array) === '[object Array]'
	},
	
	/**
	 * 判断是否为对象
	 *@param {*} Obejct
	 */
	isObject(object) {
		return Object.prototype.toString.call(object) === '[object Obejct]'
	},
	
	/**
	 * 判断是否为空
	 * @param {*} object 源对象
	 */
	isEmpty(value) {
		if (this.isArray(value)) {
			return value.length === 0
		}
		if (this.isObject(value)) {
			return this.isEmptyObject(value)
		}
		return !value
	},
	/**
	 * 获取数组长度
	 * @param {*} object 源对象
	 */
	arrLength(value){
		if (!this.isArray(value) || this.isEmpty(value)) {
			return 0
		}else{
			let arr = new Array(...value)
			return arr.length
		}
	},
	/**
	 * 是否在数组内
	 */
	inArray(search, array) {
		for (var i in array) {
			if (array[i] == search) return true
		}
		return false
	},
	/**
	 * 对象转URL参数格式
	 * {id:111,name:'xxx'} 转为 ?id=111&name=xxx
	 * @param {object} obj
	 */
	urlEncode(obj = {}) {
		const result = []
		for (var key in obj) {
			let item = obj[key]
			if (!item) {
				continue
			}
			if (this.isArray(item)) {
				item.forEach(i => {
					result.push(`${key}=${i}`)
				})
			} else {
				result.push(`${key}=${item}`)
			}
		}
		return result.join('&')
	},
	/**
	 * 设置剪切板内容
	 * @param {*} text 
	 */
	copy(text) {
		uni.setClipboardData({
			data: text,
			success: () => {
				uni.hideToast();
				this.showToast("复制成功")
			},
			fail: () => {
				this.showToast("复制失败")
			}
		});
	},
	/**
	 * 计算两个日期之差
	 * @param {string} startTime 开始时间 
	 * @param {string} endTime 结束时间 
	 * @param {string} diffType 得到的时间差类型
	 */
	getDateDiff(startTime, endTime, diffType) {
		console.log(startTime)
		console.log(endTime)
	    //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
	    startTime = startTime.replace(/\-/g, "/");
	    endTime = endTime.replace(/\-/g, "/");
	    //将计算间隔类性字符转换为小写
	    diffType = diffType.toLowerCase();
	    var sTime = new Date(startTime); //开始时间
	    var eTime = new Date(endTime); //结束时间
		
		if (sTime > eTime) {
		    return "0";
		}
	    //作为除数的数字
	    var divNum = 1;
	    switch (diffType) {
	    case "second":
	        divNum = 1000;
	        break;
	    case "minute":
	        divNum = 1000 * 60;
	        break;
	    case "hour":
	        divNum = 1000 * 3600;
	        break;
	    case "day":
	        divNum = 1000 * 3600 * 24;
	        break;
	    default:
	        break;
	    }
	    var ts = parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum))+"天";	
		return ts
	},
	/**
	 * @param {String} str (y-m-d h:i:s) y:年 m:月 d:日 h:时 i:分 s:秒
	 */
	dateTimeStr(str){
		if (!str || str == "") {return ""}
		var date = new Date(),
		year = date.getFullYear(), //年
		month = date.getMonth() + 1, //月
		day = date.getDate(), //日
		hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(), //时
		minute = date.getMinutes() < 10 ? date.getMinutes() : date.getMinutes(), //分
		second = date.getSeconds() < 10 ? date.getSeconds() : date.getSeconds(); //秒
		month >= 1 && month <= 9 ? (month = "0" + month) : "";
		day >= 0 && day <= 9 ? (day = "0" + day) : "";
		hour >= 0 && hour <= 9 ? hour : "";
		minute >= 0 && minute <= 9 ? (minute = "0" + minute) : "";
		second >= 0 && second <= 9 ? (second = "0" + second) : "";
		if(str.indexOf('y') != -1){
			str = str.replace('y', year)
		}
		if(str.indexOf('m') != -1){
			str = str.replace('m', month)
		}
		if(str.indexOf('d') != -1){
			str = str.replace('d', day)
		}
		if(str.indexOf('h') != -1){
			str = str.replace('h', hour)
		}
		if(str.indexOf('i') != -1){
			str = str.replace('i', minute)
		}
		if(str.indexOf('s') != -1){
			str = str.replace('s', second)
		}
		return str;
	},
	/**
	 * 支付
	 * @param {string} url支付接口
	 * @param {string} order_no订单编号 
	 * @param {Number} type支付方式 
	 * @param {Function} success成功回调
	 */
	async payHttp(url,order_no,type,success){
		const res = await http({
			url: url,
			data: {
				"order_no":order_no
			}
		})
		let orderInfo = res.data.payInfo;
		uni.requestPayment({
		    provider: ["wxpay","alipay"][type],
		    orderInfo: orderInfo,
			timeStamp: orderInfo.timestamp + '',
			nonceStr: orderInfo.noncestr,
			package: orderInfo.package,
			signType: "MD5",
			paySign: orderInfo.sign,
		    success(res) {
				uni.showModal({
					showCancel:false,
					title:'支付成功',
					success() {
						success && success()
					}
				})
		    },
		    fail(err) {
				console.log(err)
		        uni.showToast({
		        	icon:"none",
					title:'支付失败'
		        })
			}
		});
	}
}
export default configval;
