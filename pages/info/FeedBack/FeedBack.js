// pages/FeedBack/FeedBack.js
import Toast from '../../../dist0/toast/toast';
Page({
  data: {
    //反馈分类返回值
    radio:1,
    //反馈内容值
    content:'',
    //联系方式值
    contact:'',
    //反馈分类
    type:''
  },
  
  //反馈分类点击函数
  onClick(event){
    this.setData({
      radio: event.target.dataset.name
    });
  },
  
  //反馈内容输入
  Input(event){
    //获取输入内容
    this.setData({
      content: event.detail.value
    });
  },

  //联系方式内容
  onChange(event){
    this.setData({
      contact: event.detail
    });
  },

  //提交按钮
  Submit(event){
    var num = this.data.num
    if(this.data.radio == 1){
      this.setData({
        type :'功能建议'
      })
    }
    if (this.data.radio == 2){
      this.setData({
        type: 'BUG反馈'
      })
    }
    if (this.data.radio == 3){
      this.setData({
        type: '其他'
      })
    }
    const db = wx.cloud.database()
    db.collection('Feedback').add({
      // data 字段表示需新增的 JSON 数据
      data:{
        // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        type: this.data.type,
        contact: this.data.contact,
        content: this.data.contact
      },
      success(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        Toast.success('提交成功');
        setTimeout(function () {
          wx.switchTab({
            url: '../info'
          })
        }, 2000) //延迟时间 这里是2秒
      }
    })
  }



});