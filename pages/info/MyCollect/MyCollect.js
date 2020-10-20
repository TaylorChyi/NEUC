// pages/MySource/MySource.js
var instituteList = require('../../utils/institute.js'); 
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data:{
    currentTab:'',
    discussList: [],
    resourceList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //用openId从数据库中获取用户相应的收藏和下载重置收藏列表和下载列表
    wx.cloud.init()
    this.setData({ instituteList: instituteList.postList.instituteList })
  },
  
  /**
   * 监听页面显示
   */
  onShow:function()
  {
    var that = this
    var openid = app.globalData.userInfo.openid   //当前用户的openid
    var db = wx.cloud.database()
    db.collection('user').where({     //根据用户openid定位到user表中的myCollection
      _openid: openid
    })
    .get({
      success(res){
        var collectList = res.data[0].myCollection //collectList中存的是用户收藏问题的questionID
        var resourceList = res.data[0].resourceCollection //resourceCollection中存的是用户收藏资源的questionID

        var allQuestionList = []       //allQuestionList用来存储所有问题的数组
        var tempQuestionList = []     //tempQuestionList用来存储用户收藏的问题

        var allResourceList = []       //allResourceList用来存储所有资源的数组
        var tempResourceList = []     //tempResourceList用来存储用户收藏的资源

        var userList = []             //userList用来存所有用户的信息
        wx.cloud.callFunction({
          name:"databaseSearch",
          data:{
            collectionName:"question"
          }
        }).then(res=>{
          allQuestionList = res.result.data
          for (let x of collectList) {
            for (let y of allQuestionList) {
              if (x === y._id) {
                tempQuestionList.push(y)
                break
              }
            }
          }

          //拿到所有用户信息存入userList列表
          wx.cloud.callFunction({
            name:"databaseSearch",
            data:{
              collectionName:"user"
            }
          }).then(res=>{
            userList = res.result.data
            for(let x of tempQuestionList)
            {
              let newDate = new Date(x.date)
              let date = newDate.getFullYear() + "-" + (newDate.getMonth() + 1) + "-" + newDate.getDate()
              x.date = date
              let tag = x.tag
              let indexI = parseInt(tag.substring(0, 2), 10)
              let indexM = parseInt(tag.substring(2, 4), 10)
              let indexC = parseInt(tag.substring(4, tag.length), 10)
              let course = that.data.instituteList[indexI].children[indexM].children[indexC].label
              x.course = course

              for(let y of userList)
              {
                if(x._openid === y._openid)
                {
                  x.name = y.name
                  x.image = y.image
                  break
                }
              }
            }
            that.setData({
              discussList:tempQuestionList
            })

            wx.cloud.callFunction({
              name:"databaseSearch",

              data:{
                collectionName:"resource"
              }
            }).then(res =>{
              allResourceList = res.result.data
              for(let x of resourceList)
              {
                for(let y of allResourceList)
                {
                  if(x === y._id)
                  {
                    let newDate = new Date(y.date)
                    let date = newDate.getFullYear() + "-" + (newDate.getMonth() + 1) + "-" + newDate.getDate()
                    y.date = date

                    let tag = y.tag
                    let indexI = parseInt(tag.substring(0, 2), 10)
                    let indexM = parseInt(tag.substring(2, 4), 10)
                    let indexC = parseInt(tag.substring(4, tag.length), 10)
                    let course = that.data.instituteList[indexI].children[indexM].children[indexC].label
                    y.course = course
                    tempResourceList.push(y)
                    break
                  }
                }
              }

              for(let x of tempResourceList)
              {
                for(let y of userList)
                {
                  if(x._openid === y._openid){
                    x.name = y.name
                    x.image = y.image
                    break
                  }
                }
              }
              that.setData({
                resourceList:tempResourceList
              })
            })
          })
        })

      }
    })
  },

  /**
 * 页面相关事件处理函数--监听用户下拉动作
 */
  onPullDownRefresh: function () {
    console.log("用户下拉")
    this.onShow()
  },

  //面板切换回调函数
  onChange(e) {
    const { key } = e.detail
    this.setData({
      currentTab:key
    })
  },

  /**
   * 跳转至问答-详情页面
   */
  toDetailDiscuss: function (e) {
    let index = e.currentTarget.dataset.index
    var discussItem = this.data.discussList[index]
    var date = new Date(this.data.discussList[index].date)
    discussItem.date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()

    wx.setStorageSync('discussItem', discussItem)
    wx.navigateTo({
      url: '../../detail/discuss/discuss'
    })
    },

    /**
     * 跳转至资源详情页面
     */
    toDetailResource: function (e) {
        let index = e.currentTarget.dataset.index
        var resourceItem = this.data.resourceList[index]
        var date = new Date(this.data.resourceList[index].date)
        resourceItem.date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()

        wx.setStorageSync('resourceItem', resourceItem)
        wx.navigateTo({
            url: '../../detail/resource/resource'
        })
    }
})