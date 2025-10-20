
// 返回时间列表 ["2020", "03", "14", "22", "14", "48"]
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day, hour, minute, second].map(formatNumber)
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 校验身份证 - 返回 [验证正确与否, 年龄, 性别]
const validateIdCard = (card, date) => {
  let birthday = ''
  let gender = ''
  let city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " }
  let reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
  if (!card || !card.match(reg)) {
      // 身份证号格式错误
      return [false, 0, '']
  }else if (!city[card.substr(0, 2)]) {
    // 身份证号地址编码错误
    return [false, 0, '']
  }else {
    //18位身份证需要验证最后一位校验位
    if (card.length == 18) {
      // 获取出生年份和性别代码
      birthday = card.substr(6, 4)
      gender = card.substr(16, 1)
      card = card.split('')
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
      //校验位
      var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
      var sum = 0
      var ai = 0
      var wi = 0
      for (var i = 0; i < 17; i++) {
        ai = card[i]
        wi = factor[i]
        sum += ai * wi
      }
      var last = parity[sum % 11]
      if (last.toString() != card[17].toString()) {
        // 校验位错误
        return [false, 0, '']
      }
    }else if(card.length == 15){
      // 获取出生年份和性别代码
      birthday = '19' + card.substr(6, 2)
      gender = card.substr(14, 1)
    }
  }

  let age = date.getFullYear() - birthday
  if(age < 0){
    // 年龄为负数
    return [false, age, '']
  }
  if(gender%2 == 0){
    gender = '女'
  }else{
    gender = '男'
  }
  return [true, age, gender]
}

module.exports = {
  formatTime,
  validateIdCard
}
