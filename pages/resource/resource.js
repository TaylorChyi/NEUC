// pages/resource/display/display.js
var instituteList = require('../utils/institute.js'); 
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    resourceList: [
      {
        key: 0,
        title: '课件',
        content: []
      },
      {
        key: 1,
        title: '试卷',
        content: []
      },
      {
        key: 2,
        title: '笔记',
        content: []
      },
    ],

    visible: false,
    tag: "", //所选课程的编号
    course: "", //所选课程的名称
  },
  /**
  *-----------------------------------------------------------------------------------------------------
  */

  /**
  * 打开弹出层
  */
  onOpen() {
    this.setData({ visible: true });
  },

  /**
  * 关闭弹出层
  */
  onClose() {
    this.setData({ visible: false });
  },

  /**
  * 改变专业
  */
  onChange(e) {
    var that = this
    var length = e.detail.options.length

    if(length === 3)
    {
      this.setData({
        course: e.detail.options[2].label,
        tag: e.detail.options[length - 1].value,
        visible: false
      })
      this.onShow()
    }
    else
    {
      console.log("resource.js文件中onChange函数获得的编码长度不是3")
    }
  },
    /**
  *-----------------------------------------------------------------------------------------------------
  */
  
  
  /**
  * 改变页面
  */
  onTabsChange(e) {
    console.log('onTabsChange', e)
    var current = e.detail.key
    this.setData({
      current
    })
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  */
  
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.cloud.init()
    that.setData({
      instituteList : instituteList.postList.instituteList
    })
    var db = wx.cloud.database()
    db.collection('user').where({
      _openid: app.globalData.userInfo.openid,
    })
      .get({
        success(res) {
          console.log(res.data[0].major)
          var tag = res.data[0].major + "0"
          console.log(that.data.tag)
          var indexI = parseInt(tag.substring(0, 2), 10)
          var indexM = parseInt(tag.substring(2, 4), 10)
          var indexC = parseInt(tag.substring(4, tag.length), 10)
          console.log(indexI, indexM, indexC)
          that.setData({
            course: that.data.instituteList[indexI].children[indexM].children[indexC].label,
            tag
          })
        }
      })
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
    console.log(that.data.tag, that.data.course)
    wx.cloud.callFunction({
      name: "databaseSearch",

      data:{
        collectionName: "resource"
      }
    }).then(res=>{
      var tempResourceList = res.result.data
      console.log("tempResourceList "+tempResourceList)

      wx.cloud.callFunction({
        name: "databaseSearch",

        data: {
          collectionName: "user"
        }
      }).then(res => {
        for (let i of tempResourceList) {
          for (let j of res.result.data) {
            if (i._openid === j._openid) {
              i.image = j.image
              i.name = j.name
              break;
            }
          }
          var date = new Date(i.date)
          i.date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
        }

        //根据资源的type来放入资源列表的不同下标中
        //0是课件，1是试卷，2是笔记
        var resource0 = []
        var resource1 = []
        var resource2 = []

        for (let i of tempResourceList) {
          if (i.tag === that.data.tag) {
            if (i.type === 0) {
              resource0.push(i)
            }
            else if (i.type === 1) {
              resource1.push(i)
            }
            else {
              resource2.push(i)
            }
          }
        }
        
        //按照时间排序，将3个数组倒置
        resource0.reverse()
        resource1.reverse()
        resource2.reverse()

        that.setData({
          "resourceList[0].content": resource0,
          "resourceList[1].content": resource1,
          "resourceList[2].content": resource2,
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
   * 跳转至发表页面
   */
  toPublish() {
    wx.navigateTo({
      url: '../resource/publish/publish?update=0'
    })
  },
  
  
  /**
   * 跳转至资源-详情页面
   */
  toDetailResource: function (e) {
    let index = e.currentTarget.dataset.index
    let idx = this.data.current
    var resourceItem = this.data.resourceList[idx].content[index]

    wx.setStorageSync('resourceItem', resourceItem)

    wx.navigateTo({
      url: '../detail/resource/resource'
    })
  }
})