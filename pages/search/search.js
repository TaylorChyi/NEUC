// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchContent:"",         //用户输入的搜索内容
    allQuestionList:[],       //所有问题的列表
    questionList:[],          //用户搜索到的问题列表
    userList:[],              //存所有用户信息的列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.init()
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
   */
  onUnload: function () {

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

  },

  /**
   * 获取搜索输入
   */
  onInput: function (event) {
    let temp = event.detail.value;
    this.setData({
      searchContent: temp
    })
    this.search()
  },

  /**
   * 搜索方法
   */
  search: function(e) {

    var that = this
    that.setData({
      searchContent: e.detail.value
    })

    wx.cloud.callFunction({
      name: "databaseSearch",

      data: {
        collectionName: "question"
      }
    }).then(res => {
      that.setData({
        allQuestionList: res.result.data
      })
      wx.cloud.callFunction({
        name: "databaseSearch",

        data: {
          collectionName: "user"
        }
      }).then(res => {
        that.setData({
          userList: res.result.data
        })

        var tempQuestionList = []     //临时问题列表，用来存搜到的问题
        for (let x of that.data.allQuestionList) {
          if (x.title.search(that.data.searchContent) != -1) {    //若该问题title包含搜索内容
            tempQuestionList.push(x)
          }
        }

        for (let x of tempQuestionList) {
          for (let y of that.data.userList) {
            if (x._openid === y._openid) {
              x.name = y.name
              x.image = y.image
              break
            }
          }
        }
        that.setData({
          questionList: tempQuestionList
        })
      })
    })
  },

  /**
   * 跳转至问答-详情页面
   */
  toDetailDiscuss: function (e) {
    let index = e.currentTarget.dataset.index
    var discussItem = this.data.questionList[index]
    var date = new Date(this.data.questionList[index].date)
    discussItem.date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()

    wx.setStorageSync('discussItem', discussItem)
    wx.navigateTo({
      url: '../detail/discuss/discuss'
    })
  },

  Cancel()
  {
    console.log(e)
  }
})