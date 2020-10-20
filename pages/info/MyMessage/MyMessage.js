// pages/MyMessage/MyMessage.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notifyList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.Timing();
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
    this.getMessage()
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

  //获得消息
  getMessage: function(){
    var that =this
    console.log("获取消息")
    var db = wx.cloud.database()
    db.collection('message').where({
      target_id: app.globalData.userInfo.openid
    })
      .get({
        success(res) {
          that.setData({
            notifyList: res.data,
          })
        }
      })
  },


  //定时器
  Timing:function(){
    var that = this
    var timerTem = setTimeout(function () {
      that.onShow();
      that.Timing();
    }, 15000)
    // 保存定时器name
    that.setData({
      timer: timerTem
    })
  },

  //跳转函数
  toDetail:function(event){
    var index = event.currentTarget.dataset.index
    var questionID = this.data.notifyList[index].questionID
    var messageID = this.data.notifyList[index]._id
    //问答数据
    var discussItem = ''
    //资源数据
    var resourceItem = ''
    var db = wx.cloud.database()
    //将该条记录更新为已读
    console.log(messageID)
    wx.cloud.callFunction({
      name: 'databaseflagOfReadUpdate',
      data: {
        collectionName: 'message',
        _id: messageID
      },
      success: function (res) {
        console.log(res)
      }
    })

    //this.data.notifyList[index].flagOfRead = true
    var notify = "notifyList[" + index + "].flagOfRead"
    this.setData({
      [notify]: true
    })

    if (this.data.notifyList[index].action =='回答'){
      //获取问题内容
      db.collection('question').where({
        _id: questionID
      })
        .get({
          success(res) {
            discussItem = res.data[0]
            discussItem.name = app.globalData.userInfo.nickName
            discussItem.image = app.globalData.userInfo.avatarUrl
            let date = new Date(discussItem.date)
            discussItem.date = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay()
            wx.setStorageSync('discussItem', discussItem)
            wx.navigateTo({
                url: '../../detail/discuss/discuss'
            })
          }
        })

    }else{
      db.collection('resource').where({
        _id: questionID
      })
        .get({
          success(res) {
            resourceItem = res.data[0]
            resourceItem.name = app.globalData.userInfo.nickName
            resourceItem.image = app.globalData.userInfo.avatarUrl
            wx.setStorageSync('resourceItem', resourceItem)
            
            wx.navigateTo({
              url: '../../detail/resource/resource'
            })

          }
        })
    }

  }
})