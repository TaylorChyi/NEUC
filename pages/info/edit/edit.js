// pages/edit/edit.js
import Toast from '../../../dist0/toast/toast';
var instituteList = require('../../utils/institute.js'); 
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //专业弹出层是否打开
    show: false,
    //年级弹出层是否打开
    grade_show:false,
    //昵称
    name:'',
    //年级
    grade:'',
    //专业
    major:'',
    //数据库记录条目
    ID:'',
    columns: ['16届', '17届', '18届', '19届', '20届'],
    openId : "",
    type: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var type = options.type
    //查看页面是用于注册还是修改
    this.setData({
      type
    })

    //更新数据
    that.setData({
      userInfo: app.globalData.userInfo,
      instituteList: instituteList.postList.instituteList
    })

    if(type == 0)         //0表示更改信息，1表示注册
    {
      const db = wx.cloud.database();
      //调用云函数获取openID
      wx.cloud.callFunction({
        // 需调用的云函数名
        name: 'getOpenId',
        // 成功回调
        success: function(res){
          that.setData({
            openId: res.result.openId
          })
          //调用数据库获取值
          db.collection('user').where({
            _openid: that.data.openId
          })
            .get({
              success(res) {
                var major = res.data[0].major
                var indexI = parseInt(major.substring(0, 2), 10)
                var indexM = parseInt(major.substring(2, 4), 10)
                that.setData({
                  ID: res.data[0]._id,
                  name: res.data[0].name,
                  grade: res.data[0].grade,
                  majorName: that.data.instituteList[indexI].children[indexM].label,
                  major
                })
              }
            })
        },
      })
    }
    else
    {
      that.setData({
        name: that.data.userInfo.nickName,
      })
    }
  },
 
  //更改昵称
  ChangeName(e) {
    this.setData({
      name: e.detail.value,
    })
  },

  //更改年级
  ChangeGrade(e){
    this.setData({
      grade: e.detail.value,
    })
  },

  /**
   * 打开弹出层
   */
  onOpen() {
    this.setData({ 
      show: true,
      grade_show: false
    });
  },

  /**
  * 关闭弹出层
  */
  onClose() {
    this.setData({ show: false });
  },

  /**
  * 改变专业
  */
  onChange(e) {
    console.log(e)
    var indexI = parseInt(e.detail.value.substring(0, 2), 10)
    var indexM = parseInt(e.detail.value.substring(2, 4), 10)
    this.setData({
      major: e.detail.value,
      majorName: this.data.instituteList[indexI].children[indexM].label,
      show: false,
    })
  },

  //年级确认函数
  Onconfirm(e) {
    const { picker, value, index } = e.detail;
    this.setData({ 
      grade_show: false,
      grade:value,
  });
   
  },

  //关闭弹出层
  Cancel() {
    this.setData({ grade_show: false });
  },
  
  //打开年级控制面板
  Open_grade() {
    this.setData({ 
      show: false,
      grade_show: true
    });
  },

  //保存数据并更新到数据库
  Confirm(){
    if (this.data.type == 0)  //0表示更改信息，1表示注册
    {
      const db = wx.cloud.database();
      //获取数据的_id成功之后再更新
      db.collection('user').doc(this.data.ID).update
      ({
        //data 传入需要局部更新的数据
        data:
        {
          name: this.data.name,
          major: this.data.major,
          grade: this.data.grade,
        },
        success(res)
        {
          Toast.success('保存成功');
          setTimeout(function ()
          {
              wx.switchTab
              ({
                url: '../info'
              })
          }, 2000) //延迟时间 这里是2秒
        },
        fail(res)
        {
          Toast.fail('保存失败')
        }
      })
    }
    else  //0表示更改信息，1表示注册
    {
      const db = wx.cloud.database();
      //获取数据的_id成功之后再更新
      db.collection('user').add
        ({
          //data 传入需要局部更新的数据
          data:
          {
            // 表示将 done 字段置为 true
            name: this.data.name,
            major: this.data.major,
            grade: this.data.grade,
            image: app.globalData.userInfo.avatarUrl,
            likeList: [],
            myCollection: [],
            resourceCollection:[],
            resourceLikeList:[],
          },
          success(res) {
            Toast.success('保存成功');
            setTimeout(function () {
              wx.switchTab
                ({
                  url: '../../resource/resource'
                })
            }, 2000) //延迟时间 这里是2秒
          },
          fail(res) {
            Toast.fail('保存失败')
          }
        })
    }
  }
})