// pages/info/info.js
//获取实例
var app = getApp()

Page({
  data: {
    userInfo: {}
  },
  
  //跳转到个人信息编辑页面
  Toedit: function () {
    wx.navigateTo({
      url: '../info/edit/edit?type=0'
    })
  },
  
  //跳转到我的资源页面
  ToMyCollect: function(){
    wx.navigateTo({
      url: '../info/MyCollect/MyCollect'
    })
  },
 
  //跳转到我的发表页面
  ToMyPublish: function () {
    wx.navigateTo({
      url: '../info/MyPublish/MyPublish'
    })
  },

  //跳转到关于我们页面
  Toabout: function(){
    wx.navigateTo({
      url: '../info/about/about'
    })
  },
  
  //跳转到我的消息页面
  ToMyMessage: function () {
    wx.navigateTo({
      url: '../info/MyMessage/MyMessage'
    })
  },
  
  //跳转到问题反馈
  ToFeedBack: function () {
    wx.navigateTo({
      url: '../info/FeedBack/FeedBack'
    })
  },

  //跳转到我的下载页面
  ToMyDownload: function () {
    wx.navigateTo({
      url: '../info/MyDownload/MyDownload'
    })
  },

  //页面加载函数
  onLoad: function () {
    wx.cloud.init()
    var that = this
      //更新数据
      that.setData({
        userInfo: app.globalData.userInfo
      })
    
  },

  /**
   * onShow
   */
  onShow:function() {
    var that = this
    wx.cloud.callFunction({
      name: "databaseSearch",
      data: {
        collectionName: "user"
      },
      success(res) {
        var userList = res.result.data

        for (let x of userList) {
          if (x._openid === app.globalData.userInfo.openid) {
            that.setData({
              "userInfo.name": x.name
            })
          }
        }
      }
    })
  }
})