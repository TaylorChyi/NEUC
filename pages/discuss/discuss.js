// pages/detail/discuss/discuss.js
import { $wuxToast } from '../../dist/index'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentList:[],
    tempList:[],
    tempCommentList:[],
    userList:[],                //从数据库中拿到的所有用户的列表，在onShow中拿到，在onShow和collction都用到
    discussItem:{}, 
    isCollection: false,        //当前用户是否收藏了该问题
    isLike:false,                //当前用户是否点赞了该问题
    tempIsLike:false,         //判断用户是否点击了点赞按钮
    likeList:[],                 //当前用户的点赞列表,表中是点赞的问题_id
    myCollectionList:[],        //当前用户的收藏列表
    openid:"",                   //当前用户openid
    answer: "",               //获取用户的评论内容
    tempIsCollection: false,     //判断用户是否点击了收藏按钮
    canClick: false                //只有当页面加载完后才能进行回答点赞收藏等操作
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
    let url = this.data.discussItem.imageList
    wx.previewImage({
      current: url[index],
      urls: url
    })
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  */

    /**
     * 回复
     */
    answer: function () {
        wx.cloud.init()
        var db = wx.cloud.database()
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
            var questionID = that.data.discussItem._id
            var date = (new Date()).getTime()
            var commentID
            const _ = db.command

            db.collection('comment').add({
                data: {
                    content: content,
                    date: date,
                    questionID: questionID,
                },
                success: res => {
                    //调用云函数，把回答id加到对应question里面
                    commentID = res._id
                    wx.cloud.callFunction({
                        name: 'addCommentOfQuestion',
                        data: {
                            commentID: commentID,
                            questionID: questionID,
                        },
                    }).then(res => {
                        wx.showToast({
                            title: '回复成功',
                        })
                        var commentList = that.data.commentList
                        commentList.push({
                            content: content,
                            date: date,
                            questionID: questionID,
                            name: app.globalData.userInfo.nickName,
                            image: app.globalData.userInfo.avatarUrl,
                            _id: commentID,
                            _openid: app.globalData.userInfo.openid
                        })

                        that.setData({
                            commentList: commentList,
                        })

                        //消息
                        if (app.globalData.userInfo.openid != that.data.discussItem._openid) {
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
                                            content: that.data.discussItem.title,
                                            date: date,
                                            target_id: that.data.discussItem._openid,
                                            action: '回答',
                                            sender_name: sender_name,
                                            sender_image: sender_image,
                                            flagOfRead: false,
                                            questionID: questionID,
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
   * 收藏
   */
  collect: function () {
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
  like:function(){
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
              "discussItem.likeNum": that.data.discussItem.likeNum - 1,
              tempIsLike: false,
          })
      }
      else {
          that.setData({
              "discussItem.likeNum": that.data.discussItem.likeNum + 1,
              tempIsLike: true,
          })
      }
  },


  /**
   * 获取变化的回复输入
   */
  onInput: function(event)
  {
    let tem = event.detail.value;
    this.setData({
      answer: tem
    })
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  */

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.showLoading({
          title: '加载中',
      })
      wx.cloud.init()
      var db = wx.cloud.database()
      var that = this
      setTimeout(function () {
          try {
              var temdiscussItem = wx.getStorageSync('discussItem')
              if (temdiscussItem) {
                  var imageList = []
                  for (let i = 0; i < temdiscussItem.imageList.length; i++) {
                      imageList.push("cloud://test0-e63277.7465-test0-e63277/question/" + temdiscussItem._id + "/"
                          + temdiscussItem.imageList[i])
                  }
                  temdiscussItem.imageList = imageList;

                  db.collection('question').doc(temdiscussItem._id).get().then(res => {
                      temdiscussItem.likeNum = res.data.likeNum

                      that.setData({
                          discussItem: temdiscussItem,
                          openid: app.globalData.userInfo.openid,
                      })

                      var db = wx.cloud.database()
                      //从数据库获得comment
                      wx.cloud.callFunction({
                          name: "databaseSearch",

                          data: {
                              collectionName: "comment"
                          }
                      }).then(res => {
                          that.setData({
                              tempList: res.result.data
                          })
                          //找到commentList中属于该问题的comment,存入tempCommentList
                          var tempCommentList = []
                          for (let i = 0; i < that.data.tempList.length; i++) {
                              if (that.data.tempList[i].questionID === that.data.discussItem._id) {
                                  console.log("匹配questionID成功")
                                  tempCommentList.push(that.data.tempList[i])
                              }
                          }

                          //从数据库拿到user信息存到userList
                          wx.cloud.callFunction({
                              name: "databaseSearch",

                              data: {
                                  collectionName: "user"
                              }
                          }).then(res => {
                              that.setData({
                                  userList: res.result.data
                              })

                              //两个for循环对比userList和tempCommentList的openid，相等则把image和name给tempList
                              for (let i = 0; i < tempCommentList.length; i++) {
                                  for (let j = 0; j < that.data.userList.length; j++) {
                                      if (tempCommentList[i]._openid === that.data.userList[j]._openid) {
                                          tempCommentList[i].name = that.data.userList[j].name
                                          tempCommentList[i].image = that.data.userList[j].image
                                          break
                                      }
                                  }
                              }
                              //把tempCommentList赋给commentList
                              that.setData({
                                  commentList: tempCommentList
                              })

                              //获取用户的问题收藏列表和点赞列表
                              for (let i of that.data.userList) {
                                  if (i._openid === app.globalData.userInfo.openid) {
                                      that.setData({
                                          myCollectionList: i.myCollection,
                                          likeList: i.likeList
                                      })
                                      break
                                  }
                              }

                              //判断用户是否收藏了该问题
                              for (let x of that.data.myCollectionList) {
                                  if (x === that.data.discussItem._id) {
                                      that.setData({
                                          isCollection: true,
                                          tempIsCollection: true,
                                      })
                                      break
                                  }
                              }
                              //判断用户是否点赞了该问题
                              for (let x of that.data.likeList) {
                                  if (x === that.data.discussItem._id) {
                                      that.setData({
                                          isLike: true,
                                          tempIsLike: true
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
                  console.log('问题详细信息为空')
              }
          }
          catch (e) {
              console.log(e)
          }
      }, 1000)
  },

  /**
  * 生命周期函数--监听页面卸载
  */
    onUnload: function () {
        var that = this
        if (that.data.isLike === that.data.tempIsLike) {
            if (that.data.isCollection === that.data.tempIsCollection) {

            }
            else    //点赞未改，收藏改了
            {
                wx.cloud.init()
                var db = wx.cloud.database()
                var questionID = that.data.discussItem._id    //本问题的questionID，用来存入当前用户的myCollection或者删除对应的收藏
                var myCollectionList = []                     //当前用户的收藏列表
                var userID = ""                                  //当前用户在user数据库中的_id而不是openid

                //先根据openid从user数据库拿到该用户在数据库的userID
                for (let i of that.data.userList) {
                    if (i._openid === app.globalData.userInfo.openid) {
                        userID = i._id
                        break
                    }
                }

                if (!that.data.tempIsCollection) {    //原来收藏，现在未收藏
                    var tempCollectionList = that.data.myCollectionList
                    var deleteIndex
                    tempCollectionList.forEach(function (element, index, array) {
                        if (questionID === element) {
                            deleteIndex = index
                        }
                    })
                    tempCollectionList.splice(deleteIndex, 1)
                    db.collection('user').doc(userID).update({
                        data: {
                            myCollection: tempCollectionList
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
                            myCollection: _.push(questionID)
                        },
                        success(res) {
                            console.log(res)
                        }
                    })
                }
            }
        }
        else {
            if (that.data.isCollection === that.data.tempIsCollection)   //点赞要改，收藏不改
            {
                wx.cloud.init()
                var db = wx.cloud.database()
                var questionID = that.data.discussItem._id    //本问题的questionID，用来存入当前用户的likeList或者从其中删除
                var likeList = []                             //当前用户的点赞列表
                var userID = ""                               //当前用户在user数据库中的_id而不是openid

                //先根据openid从user数据库拿到该用户在数据库的userID
                for (let i of that.data.userList) {
                    if (i._openid === app.globalData.userInfo.openid) {
                        userID = i._id
                        break
                    }
                }

                if (!that.data.tempIsLike) {                  //之前点赞，现在未点赞
                    var tempLikeList = that.data.likeList       //从tempLikeList中删除对应的的问题_id
                    var deleteIndex
                    tempLikeList.forEach(function (element, index, array) {
                        if (questionID === element) {
                            deleteIndex = index
                        }
                    })
                    tempLikeList.splice(deleteIndex, 1)
                    db.collection('user').doc(userID).update({
                        data: {
                            likeList: tempLikeList                 //将tempLikeList覆盖到数据库中的用户的likeList
                        },
                        success(res) {
                            console.log(res)
                            that.setData({
                                likeList: tempLikeList,
                                isLike: false
                            })

                            wx.cloud.callFunction({              //将对应问题的likeNum-1
                                name: "databaseLikeNumUpdate",
                                data: {
                                    collectionName: "question",
                                    _id: questionID,
                                    num: -1
                                }
                            }).then(res => {
                            })
                        }
                    })

                }
                else {            //之前未点赞，现在点赞
                    //拿到userID后根据userID更新likeList
                    const _ = db.command
                    db.collection('user').doc(userID).update({
                        data: {
                            likeList: _.push(questionID)
                        },
                        success(res) {
                            console.log(res)
                            that.setData({
                                isLike: true
                            })

                            wx.cloud.callFunction({         //将对应问题的likeNum+1
                                name: "databaseLikeNumUpdate",
                                data: {
                                    collectionName: "question",
                                    _id: questionID,
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
                var questionID = that.data.discussItem._id    //本问题的questionID，用来存入当前用户的likeList或者从其中删除
                var likeList = []                             //当前用户的点赞列表
                var userID = ""                               //当前用户在user数据库中的_id而不是openid

                //先根据openid从user数据库拿到该用户在数据库的userID
                for (let i of that.data.userList) {
                    if (i._openid === app.globalData.userInfo.openid) {
                        userID = i._id
                        break
                    }
                }

                if (!that.data.tempIsLike) {                       //之前点赞，现在未点赞
                    var tempLikeList = that.data.likeList       //从tempLikeList中删除对应的的问题_id
                    var deleteIndex
                    tempLikeList.forEach(function (element, index, array) {
                        if (questionID === element) {
                            deleteIndex = index
                        }
                    })
                    tempLikeList.splice(deleteIndex, 1)
                    db.collection('user').doc(userID).update({
                        data: {
                            likeList: tempLikeList                 //将tempLikeList覆盖到数据库中的用户的likeList
                        },
                        success(res) {
                            console.log(res)
                            that.setData({
                                likeList: tempLikeList,
                                isLike: false
                            })

                            wx.cloud.callFunction({              //将对应问题的likeNum-1
                                name: "databaseLikeNumUpdate",
                                data: {
                                    collectionName: "question",
                                    _id: questionID,
                                    num: -1
                                }
                            }).then(res => {
                                if (!that.data.tempIsCollection) {    //原来收藏，现在未收藏
                                    var tempCollectionList = that.data.myCollectionList
                                    var deleteIndex
                                    tempCollectionList.forEach(function (element, index, array) {
                                        if (questionID === element) {
                                            deleteIndex = index
                                        }
                                    })
                                    tempCollectionList.splice(deleteIndex, 1)
                                    db.collection('user').doc(userID).update({
                                        data: {
                                            myCollection: tempCollectionList
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
                                            myCollection: _.push(questionID)
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
                else {            //之前未点赞，现在点赞
                    //拿到userID后根据userID更新likeList
                    const _ = db.command
                    db.collection('user').doc(userID).update({
                        data: {
                            likeList: _.push(questionID)
                        },
                        success(res) {
                            console.log(res)
                            that.setData({
                                isLike: true
                            })

                            wx.cloud.callFunction({         //将对应问题的likeNum+1
                                name: "databaseLikeNumUpdate",
                                data: {
                                    collectionName: "question",
                                    _id: questionID,
                                    num: 1
                                }
                            }).then(res => {
                                if (!that.data.tempIsCollection) {    //原来收藏，现在未收藏
                                    var tempCollectionList = that.data.myCollectionList
                                    var deleteIndex
                                    tempCollectionList.forEach(function (element, index, array) {
                                        if (questionID === element) {
                                            deleteIndex = index
                                        }
                                    })
                                    tempCollectionList.splice(deleteIndex, 1)
                                    db.collection('user').doc(userID).update({
                                        data: {
                                            myCollection: tempCollectionList
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
                                            myCollection: _.push(questionID)
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
   * 删除评论
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
                collectionName: "comment",
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
                        collectionName: "question",
                        _id: that.data.discussItem._id,
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