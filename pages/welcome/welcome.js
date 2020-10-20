//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        motto: '点击进入',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        userList: [],
        _id: ""    //当前用户在数据库的_id
    },
    //事件处理函数
    bindViewTap: function () {
        var that = this

        if (this.data.hasUserInfo && this.data.canIUse) {
            console.log("已获得授权")
            wx.cloud.callFunction(
                {
                    name: 'getOpenId',
                    data: {},
                    success: res => {         //获取用户授权，拿到openid
                        app.globalData.userInfo.openid = res.result.openId
                        var flag = false
                        for (let x of that.data.userList) {
                            if (x._openid === app.globalData.userInfo.openid) {
                                console.log("用户已经注册")
                                flag = true
                                break
                            }
                        }

                      var db = wx.cloud.database()
                      for (let x of that.data.userList) {
                        console.log(x._openid)
                        console.log("app " + that.data.userInfo.openid)
                        if (x._openid === app.globalData.userInfo.openid) {
                          that.setData({
                            _id: x._id
                          })
                          break
                        }
                      }

                      db.collection('user').doc(that.data._id).update({
                        data: {
                          image: app.globalData.userInfo.avatarUrl
                        },
                        success(res) {
                          console.log("image" + res.data.image)
                        }
                      })

                        if (!flag) {
                            wx.navigateTo({
                                url: '../info/edit/edit?type=1',
                            })
                        }
                        else
                        {
                          wx.switchTab({
                            url: '/pages/radio/radio',
                          })
                        }
                    }
                }
            )
        }
        else {
            console.log("未获得授权")
        }
    },

    onShow: function () {
        //加载数据库中user信息
        var that = this
        wx.cloud.init()
        wx.cloud.callFunction({
            name: "databaseSearch",

            data: {
                collectionName: "user"
            }
        }).then(res => {
            that.setData({
                userList: res.result.data
            })
            
        })
    },

    onLoad: function () {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }
    },

    getUserInfo: function (e) {
        console.log(e)
        if (e.detail.userInfo) {
            app.globalData.userInfo = e.detail.userInfo
            this.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true
            })
        }
    }
})