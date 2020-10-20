// pages/discuss/discuss.js
var instituteList = require('../utils/institute.js'); 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**
    * 之后需要从服务器端获取问答区的内容并赋值给discussList
    */
    discussList:[],
    discussItem:{},
    allQuestionList:[],
    userList:[],
    tempList: [],      //tempList用于每次显示的问题列表，注意不是包含所有问题的列表
    primaryLoadNum:5, //表示初次加载的问题数量，和每次下拉刷新完后重新加载的问题的数量
    perCount: 1,         //表示每次上拉触底加载的问题数量
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  */



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("load")
    wx.cloud.init()
    this.setData({ instituteList: instituteList.postList.instituteList })
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
    var that = this

    //获得问题列表，存入allQuestionList
    wx.cloud.callFunction({
      name: "databaseSearch",
      data:{
        collectionName: "question"
      }
    }).then(res => {

      that.setData({
        allQuestionList: res.result.data
      })

      //获得user信息，存入userList
      wx.cloud.callFunction({
        name: "databaseSearch",
        data: {
          collectionName: "user"
        }
      }).then(res => {

        that.setData({
          userList: res.result.data
        })

        //两个for循环对比userList和allQuestionList的openid，相等则把image和name给allQuestionList
        for (let i = 0; i < that.data.allQuestionList.length; i++) {
          for (let j = 0; j < that.data.userList.length; j++) {
            if (that.data.allQuestionList[i]._openid === that.data.userList[j]._openid) {
              let tag = that.data.allQuestionList[i].tag
              console.log("tag" +tag)
              let indexI = parseInt(tag.substring(0, 2), 10)
              let indexM = parseInt(tag.substring(2, 4), 10)
              let indexC = parseInt(tag.substring(4, tag.length), 10)
              console.log("index",indexI, indexM. indexC)
              let course = that.data.instituteList[indexI].children[indexM].children[indexC].label
              console.log("course" + course)
              that.data.allQuestionList[i].course = course
              that.data.allQuestionList[i].name = that.data.userList[j].name
              that.data.allQuestionList[i].image = that.data.userList[j].image
              break
            }
          }
        }

        //将问题列表allQuestionList倒置，达到按最新时间排序的效果
        that.data.allQuestionList.reverse()

        //tempList用于每次显示的问题列表，注意不是包含所有问题的列表
        //discussList是用于前端显示的问题列表，直接等于tempList即可
        that.setData({
          tempList:[]
        })
        for(let i = 0; i < that.data.primaryLoadNum; i++){
          that.data.tempList.push(that.data.allQuestionList[i])
        }
        that.setData({
          discussList: that.data.tempList
        })
      })
    })
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
    console.log("用户下拉")
    this.onShow()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    var tempLength = that.data.tempList.length
    var allLength = that.data.allQuestionList.length
    wx.showLoading({
      title: '加载中',
    })
    for (let i = tempLength; i < allLength && i < tempLength + that.data.perCount; i++){
      that.data.tempList.push(that.data.allQuestionList[i])
    }
    that.setData({
      discussList: that.data.tempList
    })
    wx.hideLoading()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
  *-----------------------------------------------------------------------------------------------------
  */

  /**
   * 跳转至发表页面
   */
  toPublish: function() 
  {
    wx.navigateTo({
      url: '../discuss/publish/publish?update=0'
    })
  },

  /**
   * 跳转至问答-详情页面
   */
  toDetailDiscuss: function(e)
  {
    let index = e.currentTarget.dataset.index
    var discussItem = this.data.discussList[index]
    var date = new Date(this.data.discussList[index].date)
    discussItem.date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()

    wx.setStorageSync('discussItem', discussItem)
    wx.navigateTo({
      url: '../detail/discuss/discuss'
    })
  },
  
    /**
  * 跳转到搜索页面
  */
  toSearch() {
    wx.navigateTo({
      url: '../search/search'
    })
  },
})