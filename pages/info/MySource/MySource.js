// pages/MySource/MySource.js
Page({

  /**
   * 页面的初始数据
   */
  data:{
    currentTab:'',
    CollectList:[
      {
        title: "英语四级复习资料",
        extra: "考级必备",
        content:"新东方英语首席主讲，写作辅导实力教师，新东方20周年功勋教师，英语学习畅销书作者。北京外国语大学英语语言文学学士，北京大学硕士，曾任中国政府代表团高级翻译出访欧美。",
        picture:"../../../images/24213.jpg",
        time:"2019.5.4"
      },
      {
        title: "英语六级复习资料",
        extra: "考级必备",
        content: "新东方英语首席主讲，写作辅导实力教师，新东方20周年功勋教师，英语学习畅销书作者。北京外国语大学英语语言文学学士，北京大学硕士，曾任中国政府代表团高级翻译出访欧美。",
        picture: "../../../images/24280.jpg",
        time: "2019.5.4"
      }
    ],
    DownloadList:[
      {
        title: "数值分析PPT",
        extra: "专业必修",
        content: "数值分析(numerical analysis)是研究分析用计算机求解数学计算问题的数值计算方法及其理论的学科，是数学的一个分支，它以数字计算机求解数学问题的理论和方法为研究对象，为计算数学的主体部分。",
        picture: "../../images/zhi.png",
        time: "2019.5.4"
      },
      {
        title: "数值分析期末试卷",
        extra: "专业必修",
        content: "数值分析(numerical analysis)是研究分析用计算机求解数学计算问题的数值计算方法及其理论的学科，是数学的一个分支，它以数字计算机求解数学问题的理论和方法为研究对象，为计算数学的主体部分。",
        picture: "../../images/book.png",
        time: "2019.5.4"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //用openId从数据库中获取用户相应的收藏和下载重置收藏列表和下载列表

  },
  
  //面板切换回调函数
  onChange(e) {
    const { key } = e.detail
    this.setData({
      currentTab:key
    })
  },

  //跳转详情页面
  Todetail(e){
    
  }
})