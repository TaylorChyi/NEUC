// pages/MyPublish/MyPublish.js
var instituteList = require('../../utils/institute.js'); 
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: '',
    //当前卡片
    currentid:'',
    right:[{
      text: '修改',
      style: 'background-color: #ddd; color: white',
    },
    {
      text: '删除',
      style: 'background-color: #F4333C; color: white',
    }],
    /**
 * 之后需要从服务器端获取问答区的内容并赋值给discussList
 */
    discussList: [],
    discussItem: {},
    resourceList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ instituteList: instituteList.postList.instituteList })
  },

  onShow: function (){
    //用openId从数据库中获取用户相应的收藏和下载重置收藏列表和下载列表
    var that = this
    const db = wx.cloud.database();
    //调用数据库获取问题值
    db.collection('question').where({
      _openid: app.globalData.userInfo.openid
    })
      .get({
        success(res) {
          var tempList=res.data     
          //用for循环将用户值拼接到问题值上
          for (let i = 0; i < tempList.length; i++) {
            tempList[i].name = app.globalData.userInfo.nickName
            tempList[i].image = app.globalData.userInfo.avatarUrl
            let tag = tempList[i].tag
            console.log("tag" + tag)
            let indexI = parseInt(tag.substring(0, 2), 10)
            let indexM = parseInt(tag.substring(2, 4), 10)
            let indexC = parseInt(tag.substring(4, tag.length), 10)
            console.log("index", indexI, indexM.indexC)
            let course = that.data.instituteList[indexI].children[indexM].children[indexC].label
            console.log("course" + course)

            let date = new Date(tempList[i].date)
            tempList[i].date = date.getFullYear() + "-" + (date.getMonth() + 1) +"-"+ date.getDate()
            tempList[i].course = course
          }
          //把tempList赋给discussList
          that.setData({
              discussList: tempList
          })
        }
      })
    
    //调用数据库获取资源值
    db.collection('resource').where({
      _openid: app.globalData.userInfo.openid
    })
      .get({
        success(res) {
          var tempResourceList=res.data
          //用for循环将用户值拼接到问题值上
          for (let i = 0; i < tempResourceList.length; i++) {
            tempResourceList[i].name = app.globalData.userInfo.nickName
            tempResourceList[i].image = app.globalData.userInfo.avatarUrl
            var date = new Date(tempResourceList[i].date)
            tempResourceList[i].date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
            let tag = tempResourceList[i].tag
            let indexI = parseInt(tag.substring(0, 2), 10)
            let indexM = parseInt(tag.substring(2, 4), 10)
            let indexC = parseInt(tag.substring(4, tag.length), 10)
            let course = that.data.instituteList[indexI].children[indexM].children[indexC].label
            tempResourceList[i].course = course
          }
          //把tempResourceList赋给resourceList
          that.setData({
              resourceList: tempResourceList
          })
        }
      })

  },
  
  //删除发表问题相关的消息数据
  deleteMessageList(Q_id){
    var that = this
    const db = wx.cloud.database();
    //调用数据库获取问题值
    db.collection('message').where({
      questionID: Q_id
    })
      .get({
        success(res) {
         var messageList = res.data
         //删除与该问题相关的消息
        for (let i = 0; i < messageList.length; i++) {
          that.delete_comment(messageList[i]._id, 'message');
        }
        console.log('删除消息成功')
      }
    })
  },

  //面板切换回调函数
  onChange(e) {
    const { key } = e.detail
    this.setData({
      currentTab: key
    })
  },

  //跳转问答详情页面
  toDetailDiscuss(e){
    var discussItem = this.data.discussList[this.data.currentid]
    wx.setStorageSync('discussItem_update', discussItem)
    wx.redirectTo({
      url: '../../discuss/publish/publish?update=1'
    })
  },

  //跳转资源详情页面
  toDetailResource(e){
    var resourceItem = this.data.resourceList[this.data.currentid]
    wx.setStorageSync('resourceItem_update', resourceItem)
    wx.redirectTo({
      url: '../../resource/publish/publish?update=1'
    })
  },

  //传递参数
  transmit_id(e){
    console.log(e)
    this.setData({
      currentid: e.currentTarget.id
    })
  },

  //删除评论
  delete_comment(C_id,Name){
    wx.cloud.callFunction({
      name: 'databaseRemove',
      data: {
        collectionName: Name,
        _id: C_id
      },
      success: function () {
        console.log('评论删除成功')
      }
    })
  },

  //删除问题
  delete_question(Q_id,Name){
    const db = wx.cloud.database();
    db.collection(Name).doc(Q_id).remove({
      success: console.log('删除成功'),
    })
  },

  //删除文件
  delete_file(F_list){
    wx.cloud.deleteFile({
      fileList: F_list,
      success: res => {
        console.log('旧文件删除成功')
      },
      fail: console.error
    })
  },

  //点击资源条目事件
  onClick_resource(e){
    var that = this;
    if (e.detail.value.text == "删除") {
      wx.showModal({
        title: '提示',
        content: '确定要删除您发布的资源吗？',
        success(res) {
          if (res.confirm) {
            //获得当前记录
            var resourceItem = that.data.resourceList[that.data.currentid]
            //先删除评论
            for (let i = 0; i < resourceItem.commentList.length; i++) {
              that.delete_comment(resourceItem.commentList[i],'resourceComment');
            }
            //再删除问题
            that.delete_question(resourceItem._id,'resource');
            //删除图片文件
            var list_image = [];
            if (resourceItem.imageList.length > 0) {
              for (var i = 0; i < resourceItem.imageList.length; i++) {
                list_image.push('cloud://test0-e63277.7465-test0-e63277/resource/' + resourceItem._id + '/image/' + resourceItem.imageList[i])
              }
              that.delete_file(list_image)
            }
            //删除消息条目
            that.deleteMessageList(resourceItem._id)
            //删除资源文件
            var list_file = [];
            if(resourceItem.fileList.length > 0){
              for (var i = 0; i < resourceItem.fileList.length; i++) {
                list_file.push('cloud://test0-e63277.7465-test0-e63277/resource/' + resourceItem._id + '/file/' + resourceItem.fileList[i].name)
              }
              that.delete_file(list_file)
            }
            //通过跳转刷新页面
            wx.redirectTo({
              url: '/pages/info/MyPublish/MyPublish'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    //否则跳转修改页面
    } else {
      that.toDetailResource();
    }
  },
  
  //点击问答条目事件
  onClick_discuss(e){
    var that = this;
    if(e.detail.value.text == "删除"){
      wx.showModal({
        title: '提示',
        content: '确定要删除您的提问吗？',
        success(res) {
          if (res.confirm) {
            //获得当前记录
            var discussItem = that.data.discussList[that.data.currentid]
            //先删除评论
            for (let i = 0; i < discussItem.commentList.length; i++) {
              that.delete_comment(discussItem.commentList[i],'comment');
            }
            //再删除问题
            that.delete_question(discussItem._id,'question');
            //删除图片文件
            var list = [];
            if (discussItem.imageList.length > 0) {
              for (var i = 0; i < discussItem.imageList.length; i++) {
                list.push('cloud://test0-e63277.7465-test0-e63277/question/' + discussItem._id + '/' + discussItem.imageList[i])
              }
              that.delete_file(list)
            }
            //删除消息条目
            that.deleteMessageList(discussItem._id)
            //通过跳转刷新页面
            wx.redirectTo({
              url: '/pages/info/MyPublish/MyPublish'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    //否则跳转修改页面
    }else{
        that.toDetailDiscuss();
    }
  },
})