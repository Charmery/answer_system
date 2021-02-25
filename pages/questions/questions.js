// pages/questions/questions.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //题目列表
    list: [{
        type: '多', //“多”为多选题，“单”为单选题
        question: '问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述问题描述',
        answers: ['选项一', '选项二', '选项三', '选项四'],
        rightanswers: ['选项一', '选项二'],
        analyze: '解释1'
      },
      {
        type: '单',
        question: '测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试',
        answers: ['选项1', '选项2', '选项3', '选项4'],
        rightanswers: '选项1',
        analyze: '解释2'
      },
      {
        type: '多',
        question: '短题目测试',
        answers: ['1', '2', '3', '4'],
        rightanswers: ['2', '3'],
        analyze: '解释三'
      },
      {
        type: '单',
        question: '短题目测试',
        answers: ['1', '2', '3', '4'],
        rightanswers: '2',
        analyze: '解释四'
      }
    ],
    maxindex: 4,
    grade: 0,
    index: 0, //题目序号
    state: false, //用于清除上一道题目所选的答案
    stopflag: false,
    time: 0,
    setInter: '',
    oneMoreTimeFlag: true,
    RestAnswerTime: 0,
    analyzeflag: false
  },
  formAnalyzeToNext: function () {
    var index = this.data.index
    var maxindex = this.data.maxindex
    if (index == maxindex) {
      this.setData({
        analyzeflag: false,
        stopflag: true
      })
    } else {
      this.setData({
        analyzeflag: false
      })
    }
  },
  //点击提交之后对比答案，正确则加分，不正确则不加分。
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    //判断对错
    var index = this.data.index
    console.log(index)
    var totalGrade = this.data.grade
    var grade = this.checker(e, index)
    totalGrade = totalGrade + grade
    console.log("分数" + grade)
    if (grade == 0) {
      this.setData({
        analyzeflag: true
      })
    }
    var maxindex = this.data.maxindex - 1
    if (index == maxindex) {
      console.log("最后一题")
      if (grade == 0) {
        console.log("还答错了")
        this.setData({
          stopflag: false
        })
      } else {
        this.setData({
          stopflag: true
        })
      }
    }
    //最后一题时自动提交
    var RestAnswerTime = this.data.RestAnswerTime
    if (RestAnswerTime == 0 && index == maxindex) {
      console.log("最后一次自动提交")
      this.updateGrade()
    }
    //跳转下一题
    index = index + 1
    this.setData({
      index: index,
      state: false, //刷新答案选中状态
      grade: totalGrade,
    })

  },
  //计时器
  timer: function () {
    var that = this;
    //将计时器赋值给setInter
    that.data.setInter = setInterval(
      function () {
        var numVal = that.data.time + 1
        that.setData({
          time: numVal
        })
      }, 1000)
  },
  //打分
  checker: function (e, index) {
    var rightanswers = this.data.list[index].rightanswers
    var grade = 0
    if (this.data.list[index].type == '多') {
      var useranswers = e.detail.value.checkbox
      if (rightanswers.length != useranswers.length) {
        grade = 0
      } else {
        var rightflag = true
        for (var answer in useranswers) {
          var flag = true
          for (var rightanswer in rightanswers) {
            if (useranswers[answer] == rightanswers[rightanswer]) {
              flag = true
              break
            }
            flag = false
          }
          console.log(flag)
          rightflag = rightflag && flag
        }
        if (rightflag == true) {
          grade = 10
        }
      }
    } else if (this.data.list[index].type == '单') {
      var useranswer = e.detail.value.radio
      var rightanswer = this.data.list[index].rightanswers
      if (useranswer == rightanswer) {
        grade = 10
      }
    }
    return grade
  },
  //再做一次
  toQuestions: function () {
    var that = this
    var RestAnswerTime = that.data.RestAnswerTime
    //上个提交的保险，防止自动提交失效，需要在后端进行筛选提交报文
    if (RestAnswerTime == 0) {
      that.updateGrade()
      wx.showModal({
        title:'温馨提示',
        content:'今天答题次数用完了',
        showCancel:false,
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: '../questions/questions',
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '每天答题次数有限，请认真答题',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: '../questions/questions',
            })
          }
        }
      })
    }

  },
  //上传分数到数据库中
  updateGrade: function () {
    console.log("提交数据库")
    var bestGrade = app.globalData.bestGrade
    var nowGrade = this.data.grade
    if (nowGrade > bestGrade) {
      console.log("提交" + nowGrade)
    } else {
      console.log("提交" + bestGrade)
    }
  },
  toUpdateGrade:function(){
    this.updateGrade()
    wx.showModal({
      title: '',
      content: '提交成功',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          wx.redirectTo({
            url: '../index/index',
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   * 判断今日剩余答题次数是否为0
   * 启动本次答题的计数器
   */
  onLoad: function () {
    var RestAnswerTime = app.globalData.MaxAnserTime
    RestAnswerTime = RestAnswerTime - 1
    if (RestAnswerTime < 0) {
      this.setData({
        oneMoreTimeFlag: false
      })
    }
    app.globalData.MaxAnserTime = RestAnswerTime
    this.setData({
      RestAnswerTime: RestAnswerTime
    })
    this.timer()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   * 获取当前所以分数中最高一次的分数
   */
  onUnload: function () {
    var bestGrade = app.globalData.bestGrade
    var nowGrade = this.data.grade
    if (nowGrade > bestGrade) {
      app.globalData.bestGrade = nowGrade
    }
    clearInterval(this.data.setInter)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})