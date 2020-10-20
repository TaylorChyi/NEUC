// pages/detail/resource/resource.js
import { $wuxToast } from '../../../dist/index'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    answer:'',
    resourceItem:{},
    commentList:[],             //前端调用的commentList
    userList:[],                //存放所有用户信息
    tempCommentList:[],         //当前回答的信息临时数组
    allCommentList:[],          //所有回答信息
    isCollection: false,        //当前用户是否收藏了该资源
    tempIsCollection:false,     //判断当前用户是否点击了收藏按钮  
    isLike: false,                //当前用户是否点赞了该资源
    tempIsLike:false,           //判断当前用户是否点击了点赞按钮
    resourceLikeList: [],         //当前用户的点赞列表,表中是点赞的资源_id
    resourceCollectionList: [],    //当前用户的资源收藏列表
    canClick: false,                //只有当页面加载完后才能进行回答点赞收藏等操作
    openid:"",                    //获取当前用户的openid
  },
  /**
  *-----------------------------------------------------------------------------------------------------
  */

  /**
  *预览图片
  */
  previewImage(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    let url = this.data.resourceItem.imageList
    wx.previewImage({
      current: url[index],
      urls: url
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.showLoading({
          title: '加载中',
      })
      wx.cloud.init()
      var that = this
      var db = wx.cloud.database()
      setTimeout(function () {
          try {
              var temresourceItem = wx.getStorageSync('resourceItem')
              if (temresourceItem) {
                var imageList = []
                for (let i = 0; i < temresourceItem.imageList.length; i++) {
                  imageList.push("cloud://test0-e63277.7465-test0-e63277/resource/" + temresourceItem._id + "/image/"
                    + temresourceItem.imageList[i])
                }
                temresourceItem.imageList = imageList;
                  db.collection('resource').doc(temresourceItem._id).get().then(res => {
                      temresourceItem.likeNum = res.data.likeNum
                      for(let x of temresourceItem.fileList)
                      {
                        x.showName = x.name.substring(x.name.lastIndexOf("_") + 1, x.name.length)
                      }
                      that.setData({
                          resourceItem: temresourceItem,
                          openid: app.globalData.userInfo.openid,
                      })

                      //拿到所有评论
                      wx.cloud.callFunction({
                          name: 'databaseSearch',

                          data: {
                              collectionName: "resourceComment"
                          }
                      }).then(res => {
                          that.setData({
                              allCommentList: res.result.data
                          })
                          var tempCommentList = []
                          //把属于该问题的评论加到tempCommentList中
                          for (let x of that.data.allCommentList) {
                              if (x.resourceID === that.data.resourceItem._id) {
                                  tempCommentList.push(x)
                              }
                          }
                          //拿到所有用户信息
                          wx.cloud.callFunction({
                              name: 'databaseSearch',

                              data: {
                                  collectionName: "user"
                              }
                          }).then(res => {
                              that.setData({
                                  userList: res.result.data
                              })

                              //找到每条评论的name和image并加到tempCommentList中
                              for (let i of tempCommentList) {
                                  console.log("i openid " + i._openid)
                                  for (let j of that.data.userList) {
                                      console.log("j openid " + j._openid)
                                      if (i._openid === j._openid) {
                                          i.name = j.name
                                          i.image = j.image
                                          console.log('sucess!!')
                                      }
                                  }
                              }

                              that.setData({
                                  commentList: tempCommentList
                              })

                              //获取用户的资源收藏列表和点赞列表
                              for (let i of that.data.userList) {
                                  if (i._openid === app.globalData.userInfo.openid) {
                                      that.setData({
                                          resourceCollectionList: i.resourceCollection,
                                          resourceLikeList: i.resourceLikeList
                                      })
                                      break
                                  }
                              }

                              //判断用户是否收藏了该问题
                              for (let x of that.data.resourceCollectionList) {
                                  if (x === that.data.resourceItem._id) {
                                      that.setData({
                                          isCollection: true,
                                          tempIsCollection: true,
                                      })
                                      break
                                  }
                              }
                              //判断用户是否点赞了该问题
                              for (let x of that.data.resourceLikeList) {
                                  if (x === that.data.resourceItem._id) {
                                      that.setData({
                                          isLike: true,
                                          tempIsLike: true,
                                      })
                                      break
                                  }
                              }
                              that.setData({
                                  canClick: true
                              })
                              wx.hideLoading()
                          })
                      })
                  })
              }
              else {
                  console.log('资源详细信息为空')
              }
          }
          catch (e) {
              console.log(e)
          }
      }, 1000)
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
      var that = this
      var db = wx.cloud.database()
      if (that.data.isLike === that.data.tempIsLike)   //点赞未改
      {
          if (that.data.isCollection === that.data.tempIsCollection) {

          }
          else        //点赞未改，收藏改了
          {
              wx.cloud.init()
              var resourceID = that.data.resourceItem._id
              var userID = ""                                  //用户在user数据库中_id

              //先根据openid从user数据库拿到该用户在数据库的userID
              for (let i of that.data.userList) {
                  if (i._openid === app.globalData.userInfo.openid) {
                      userID = i._id
                      break
                  }
              }

              if (!that.data.tempIsCollection)       //原来收藏，现在未收藏
              {
                  var tempCollectionList = that.data.resourceCollectionList

                  var deleteIndex
                  tempCollectionList.forEach(function (element, index, array) {
                      if (resourceID === element) {
                          deleteIndex = index
                      }
                  })

                  tempCollectionList.splice(deleteIndex, 1)
                  db.collection('user').doc(userID).update({
                      data: {
                          resourceCollection: tempCollectionList
                      },
                      success(res) {
                          console.log(res)
                      }
                  })
              }
              else          //原来未收藏，现在收藏
              {
                  //拿到userID后根据userID更新resourceCollection
                  const _ = db.command
                  db.collection('user').doc(userID).update({
                      data: {
                          resourceCollection: _.push(resourceID)
                      },
                      success(res) {
                          console.log(res)
                      }
                  })
              }
          }
      }
      else        //点赞已改
      {
          if (that.data.isCollection === that.data.tempIsCollection)//点赞改，收藏不改
          {
              wx.cloud.init()
              var db = wx.cloud.database()
              var resourceID = that.data.resourceItem._id
              var userID = ""

              //先根据openid从user数据库拿到该用户在数据库的userID
              for (let i of that.data.userList) {
                  if (i._openid === app.globalData.userInfo.openid) {
                      userID = i._id
                      break
                  }
              }

              if (!that.data.tempIsLike)       //之前点赞，现在未点赞
              {
                  var tempLikeList = that.data.resourceLikeList
                  var deleteIndex
                  tempLikeList.forEach(function (element, index, array) {
                      if (resourceID === element) {
                          deleteIndex = index
                      }
                  })

                  tempLikeList.splice(deleteIndex, 1)
                  db.collection('user').doc(userID).update({
                      data: {
                          resourceLikeList: tempLikeList
                      },
                      success(res) {

                          wx.cloud.callFunction({              //将对应问题的likeNum-1
                              name: "databaseLikeNumUpdate",
                              data: {
                                  collectionName: "resource",
                                  _id: resourceID,
                                  num: -1
                              }
                          }).then(res => {
                          })
                      }
                  })
              }
              else    //之前未点赞，现在点赞
              {
                  const _ = db.command
                  db.collection('user').doc(userID).update({
                      data: {
                          resourceLikeList: _.push(resourceID)
                      },
                      success(res) {
                          console.log(res)

                          wx.cloud.callFunction({         //将对应问题的likeNum+1
                              name: "databaseLikeNumUpdate",
                              data: {
                                  collectionName: "resource",
                                  _id: resourceID,
                                  num: 1
                              }
                          }).then(res => {
                          })
                      }
                  })
              }
          }
          else    //点赞收藏都要改
          {
              wx.cloud.init()
              var db = wx.cloud.database()
              var resourceID = that.data.resourceItem._id
              var userID = ""

              //先根据openid从user数据库拿到该用户在数据库的userID
              for (let i of that.data.userList) {
                  if (i._openid === app.globalData.userInfo.openid) {
                      userID = i._id
                      break
                  }
              }

              if (!that.data.tempIsLike)    //之前点赞，现在未点赞
              {
                  var tempLikeList = that.data.resourceLikeList  //从tempLikeList中删除对应的的问题_id
                  var deleteIndex
                  tempLikeList.forEach(function (element, index, array) {
                      if (resourceID === element) {
                          deleteIndex = index
                      }
                  })
                  tempLikeList.splice(deleteIndex, 1)
                  db.collection('user').doc(userID).update({
                      data: {
                          resourceLikeList: tempLikeList                 //将tempLikeList覆盖到数据库中的用户的likeList
                      },
                      success(res) {
                          console.log(res)
                          var db = wx.cloud.database()
                          wx.cloud.callFunction({              //将对应问题的likeNum-1
                              name: "databaseLikeNumUpdate",
                              data: {
                                  collectionName: "resource",
                                  _id: resourceID,
                                  num: -1
                              }
                          }).then(res => {
                              if (!that.data.tempIsCollection) {    //原来收藏，现在未收藏
                                  var tempCollectionList = that.data.resourceCollectionList
                                  var deleteIndex
                                  tempCollectionList.forEach(function (element, index, array) {
                                      if (resourceID === element) {
                                          deleteIndex = index
                                      }
                                  })
                                  tempCollectionList.splice(deleteIndex, 1)
                                  db.collection('user').doc(userID).update({
                                      data: {
                                          resourceCollection: tempCollectionList
                                      },
                                      success(res) {
                                          console.log(res)
                                      }
                                  })
                              }
                              else {        //原来未收藏，现在收藏
                                  //拿到userID后根据userID更新resourceCollection
                                  const _ = db.command
                                  db.collection('user').doc(userID).update({
                                      data: {
                                          resourceCollection: _.push(resourceID)
                                      },
                                      success(res) {
                                          console.log(res)
                                      }
                                  })
                              }
                          })
                      }
                  })

              }
              else      //之前未点赞，现在点赞
              {
                  //拿到userID后根据userID更新likeList
                  const _ = db.command
                  db.collection('user').doc(userID).update({
                      data: {
                          resourceLikeList: _.push(resourceID)
                      },
                      success(res) {
                          console.log(res)

                          wx.cloud.callFunction({         //将对应问题的likeNum+1
                              name: "databaseLikeNumUpdate",
                              data: {
                                  collectionName: "resource",
                                  _id: resourceID,
                                  num: 1
                              }
                          }).then(res => {
                              if (!that.data.tempIsCollection) {    //原来收藏，现在未收藏
                                  var tempCollectionList = that.data.resourceCollectionList
                                  var deleteIndex
                                  tempCollectionList.forEach(function (element, index, array) {
                                      if (resourceID === element) {
                                          deleteIndex = index
                                      }
                                  })
                                  tempCollectionList.splice(deleteIndex, 1)
                                  db.collection('user').doc(userID).update({
                                      data: {
                                          resourceCollection: tempCollectionList
                                      },
                                      success(res) {
                                          console.log(res)
                                      }
                                  })
                              }
                              else {        //原来未收藏，现在收藏
                                  //拿到userID后根据userID更新myCollection
                                  const _ = db.command
                                  db.collection('user').doc(userID).update({
                                      data: {
                                          resourceCollection: _.push(resourceID)
                                      },
                                      success(res) {
                                          console.log(res)
                                      }
                                  })
                              }
                          })
                      }
                  })
              }
          }
      }
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
   * 收藏
   */
  collect:function(){
      var that = this
      if (!that.data.canClick) {
          $wuxToast().show({
              type: 'forbidden',
              duration: 1500,
              color: '#fff',
              text: '请等待加载',
              success: () => console.log('请等待加载')
          })
          return
      }
      if (that.data.tempIsCollection) {
          that.setData({
              tempIsCollection: false,
          })
      }
      else {
          that.setData({
              tempIsCollection: true,
          })
      }
  },

  /**
   * 点赞
   */
  like: function () {
      var that = this
      if (!that.data.canClick) {
          $wuxToast().show({
              type: 'forbidden',
              duration: 1500,
              color: '#fff',
              text: '请等待加载',
              success: () => console.log('请等待加载')
          })
          return
      }
      if (that.data.tempIsLike) {
          that.setData({
              "resourceItem.likeNum": that.data.resourceItem.likeNum - 1,
              tempIsLike: false,
          })
      }
      else {
          that.setData({
              "resourceItem.likeNum": that.data.resourceItem.likeNum + 1,
              tempIsLike: true,
          })
      }
  },



  /**
   * 发送回复按钮
   */
  send:function()
  {
      var that = this
      if (!that.data.canClick) {
          $wuxToast().show({
              type: 'forbidden',
              duration: 1500,
              color: '#fff',
              text: '请等待加载',
              success: () => console.log('请等待加载')
          })
          return
      }
      var content = that.data.answer
      that.setData({
          answer: ""
      })
      if (content.replace(/\s*/g, "") === '') {
          $wuxToast().show({
              type: 'cancel',
              duration: 1500,
              color: '#fff',
              text: '评论内容不能为空',
              success: () => console.log('评论内容不能为空')
          })
      }
      else {
          var db = wx.cloud.database()
          let date = (new Date()).getTime()
          let resourceID = that.data.resourceItem._id
          var commentID
          db.collection('resourceComment').add({
              data: {
                  content: content,
                  date: date,
                  resourceID: resourceID
              },
              success: res => {
                  //调用云函数，把资源评论id加到对应resource里面
                  commentID = res._id
                  wx.cloud.callFunction({
                      name: 'addCommentOfResource',
                      data: {
                          commentID: commentID,
                          resourceID: resourceID,
                      },
                  }).then(res => {
                      wx.showToast({
                          title: '回复成功',
                      })

                      let commentList = that.data.commentList
                      commentList.push({
                          content: content,
                          date: date,
                          resourceID: resourceID,
                          name: app.globalData.userInfo.nickName,
                          image: app.globalData.userInfo.avatarUrl,
                          _id: commentID,
                          _openid: app.globalData.userInfo.openid,
                      })
                      that.setData({
                          commentList
                      })

                      //发送消息
                      if (app.globalData.userInfo.openid != that.data.resourceItem._openid) {
                          //发送者昵称
                          var sender_name = ''
                          //发送者头像
                          var sender_image = ''
                          //创建消息数据
                          db.collection('user').where({
                              //评论者的openId
                              _openid: app.globalData.userInfo.openid
                          }).get({
                              success(res) {
                                  sender_name = res.data[0].name,
                                      sender_image = res.data[0].image

                                  db.collection('message').add({
                                      data: {
                                          content: that.data.resourceItem.title,
                                          date: date,
                                          target_id: that.data.resourceItem._openid,
                                          action: '资源',
                                          sender_name: sender_name,
                                          sender_image: sender_image,
                                          flagOfRead: false,
                                          resourceID: that.data.resourceItem._id,
                                      },
                                      success: res => {
                                          console.log('信息已存入数据库')
                                      }
                                  })
                              }
                          })
                      }
                  })
              }
          })
      }
  },

  /**
  * 获取变化的回复输入
  */
  onInput: function (event) {
    let tem = event.detail.value;
    this.setData({
      answer: tem
    })
  },

  //下载并预览文件
  downloadFile: function (event) {
    var index = event.currentTarget.dataset.index
    var fileName = this.data.resourceItem.fileList[index].name
    var cloudUrl = 'cloud://test0-e63277.7465-test0-e63277/resource/' + this.data.resourceItem._id + '/file/' + fileName
    //下载的链接
    var Url = ''
    //获取云端图片下载连接
    wx.cloud.getTempFileURL({
      fileList: [cloudUrl],
      success: res => {
        Url = res.fileList[0].tempFileURL
        //下载文件
        wx.downloadFile({
          url: Url,
          success: function (res) {
            if (res.statusCode === 200) {
              //文件路径
              const filePath = res.tempFilePath
              //打开文件
              wx.openDocument({
                filePath,
                success(res) {
                  console.log('打开文档成功')
                }
              })
            } else {
              console.log('响应失败', res.statusCode)
            }
          }
        })
      },
      fail: err => {
        console.log(获取云端路径失败)
      }
    })
  },
  
  /**
   * 删除资源评论
   */
  answerDelete: function (e) {
      var that = this
      if (!that.data.canClick) {
          $wuxToast().show({
              type: 'forbidden',
              duration: 1500,
              color: '#fff',
              text: '请等待加载',
              success: () => console.log('请等待加载')
          })
          return
      }
      let index = e.currentTarget.dataset.index
      console.log("index " + index)
      let _id = that.data.commentList[index]._id
      console.log("_id " + _id)
      wx.cloud.callFunction({
          name: "databaseRemove",
          data: {
              collectionName: "resourceComment",
              _id: _id
          },
      })
          .then(res => {
              let tempCommentList = that.data.commentList
              tempCommentList.splice(index, 1)
              console.log(tempCommentList)
              wx.cloud.callFunction({
                  name: "databaseCommentListUpdate",

                  data: {
                      collectionName: "resource",
                      _id: that.data.resourceItem._id,
                      list: tempCommentList,
                  }
              }).then(res => {
                  that.setData({
                      commentList: tempCommentList
                  })
                  wx.showToast({
                      title: "删除评论成功",
                  })
                  console.log(" 删除成功")
              })
          })
  },
})