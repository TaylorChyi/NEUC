// pages/resource/publish/publish.js
import { $wuxToast } from '../../../dist/index'
var instituteList = require('../../utils/institute.js'); 
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    columns: ['课件', '试卷', '笔记'],
    imgs: [], //选中的所有图片的本地地址
    imageList:[], //选中的所有图片的文件名
    file: [],//选区的所有文件的本地地址
    fileList:[], //选区的所有文件的文件名
    //ResourceID:"",   //当前资源帖的ID
    tag: "", //课程的编码
    course: "", //课程的名称
    type: "", //种类编码，不能赋默认值为0，否则无法进行合法性检测
    typeName: "", //种类名称
    coin: 0,  //目前暂不使用，只是赋一个默认值
	
	//尘劳关锁
    title:"",//标题
    content:"",//内容
    update: '',//是否为更新的标识
    resourceItem:{},
    //图片临时路径列表
    url_image_List:[], 
    //文件临时路径列表
    url_file_List:[],
    //文件云端路径列表
    cloud_file_List:[],
    //云端图片链接数组
    old_image_List: [],
    //评论列表
    commentList: [],
    //图片列表
    imageList: [],
    //云端文件链接数组,
    old_file_List: [],
    //尘劳关锁
	
    visible: false,
    show : false
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  * 从数据库中初始各类变量
  */

  /**
   * 生命周期函数--监听页面加载
   */
  //在此加载instituteList从数据库中
  onLoad: function (options) {
    var that = this;
    wx.cloud.init()
    that.setData({ instituteList: instituteList.postList.instituteList })

    //尘劳关锁
    that.setData({
      update: options.update
    })
    //如果有参数update为1，则此页面跳转来自修改页面
    if (options.update == 1) {
      wx.getStorage({
        key: 'resourceItem_update',
        success(res) {
          that.setData({
            resourceItem: res.data,
          })

          var tag = that.data.resourceItem.tag
          var indexI = parseInt(tag.substring(0, 2), 10)
          var indexM = parseInt(tag.substring(2, 4), 10)
          var indexC = parseInt(tag.substring(4, tag.length), 10)
          var course = that.data.instituteList[indexI].children[indexM].children[indexC].label

          that.setData({
            title: that.data.resourceItem.title,
            content: that.data.resourceItem.content,
            tag,
            course,
            commentList: that.data.resourceItem.commentList,
            imageList: that.data.resourceItem.imageList,
            file: that.data.resourceItem.fileList,
            type: that.data.resourceItem.type,
            likeNum: that.data.resourceItem.likeNum
          })
          var list_image = [];
          if (that.data.imageList.length > 0) {
            for (var i = 0; i < that.data.imageList.length; i++) {
              list_image.push('cloud://test0-e63277.7465-test0-e63277/resource/' + that.data.resourceItem._id + '/image/' + that.data.resourceItem.imageList[i])
              that.data.old_image_List.push('cloud://test0-e63277.7465-test0-e63277/resource/' + that.data.resourceItem._id + '/image/' + that.data.resourceItem.imageList[i])
            }
          }
          var list_file = [];
          if (that.data.file.length > 0) {
            for (var i = 0; i < that.data.file.length; i++) {
              var url = 'cloud://test0-e63277.7465-test0-e63277/resource/' + that.data.resourceItem._id + '/file/' + that.data.resourceItem.fileList[i].name
              list_file.push(url)
              that.data.old_file_List.push(url)
              that.data.file[i].path = url
            }
          }
          that.setData({
            imgs: list_image,
            cloud_file_List: list_file,
            typeName: that.data.columns[that.data.type]
          })
        }
      })
    }
    //尘劳关锁
  },
  
  onShow: function(){

  },

  /**
  *-----------------------------------------------------------------------------------------------------
  * 用户标题的各类操作
  */

  /**
   * 获取用户输入的标题
   */
  onTitle: function (event) {
    let tem = event.detail.value;
    this.setData({
      title: tem
    })
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  * 用户内容的相关操作
  */

  /**
   * 获取用户输入的内容
   */
  onContent: function (event) {
    let tem = event.detail.value;
    this.setData({
      content: tem
    })
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  * 专业有关的各类操作
  */
  /**
  * 打开弹出层
  */
  onOpen() {
    this.setData({ visible: true });
  },

  Open_type()
  {
    this.setData({ show : true});
  },

  /**
  * 关闭弹出层
  */
  onClose() {
    this.setData({ visible: false });
  },

  Cancel(){
    this.setData({ show: false });
  },

  /**
  * 改变专业
  */
  onChange(e) {
    var that = this
    var length = e.detail.options.length

    if (length === 3) {
      this.setData({
        course: e.detail.options[2].label,
        tag: e.detail.options[length - 1].value,
        visible: false
      })
    }
  },

  ChangeType(e){

    this.setData({
      type: e.detail.index,
      typeName: e.detail.value,
    })
  },

  Cancel() {
    this.setData({ show: false });
  },

  Onconfirm(e)
  {
    this.setData({
      type: e.detail.index,
      typeName: e.detail.value,
      show: false
    })
  },


  /**
  *-----------------------------------------------------------------------------------------------------
  * 金币有关的各类操作
  */

  /**
  * 获取用户分配的积分
  */
  onCoin: function (event) {
    let tem = event.detail.value;
    this.setData({
      coin: tem
    })
  },

  /**
   * 改变标签选择器
   */
  onChangeC(e) {
    this.setData({ coin: e.detail.value })
    console.log('onChangeC', e.detail)
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  * 上传所需的各类操作
  */

  /**
  * 发表操作
  */
  publish: function () {
    var that = this
    if (
      that.data.title.replace(/\s*/g, "") === '' ||
      that.data.tag.replace(/\s*/g, "") === '' ||
      that.data.content.replace(/\s*/g, "") === '' ||
      that.data.type === '' //type的值为数字，不能使用replace方法
    ) {
      $wuxToast().show({
        type: 'cancel',
        duration: 1500,
        color: '#fff',
        text: '标题、内容、课程和类别不能为空',
        success: () => console.log('标题、内容、课程和类别不能为空')
      })
    }
    else {
      if (that.data.file.length === 0){
        $wuxToast().show({
          type: 'cancel',
          duration: 1500,
          color: '#fff',
          text: '请至少上传1个文件',
          success: () => console.log('请至少上传1个文件')
        })
      }
      else{
        //如果为更新操作
        if (that.data.update == 1) {
          wx.showLoading({
            title: '修改中',
          })
          //获取图片数量
          var image_number = that.data.imgs.length
          var picture = []
          //获取文件数量
          var file_number = that.data.file.length
          var date = new Date().getTime();

          //组装临时list
          var image_arrList = []
          var file_arrList = []
          var image_numList = []
          var file_numList = []
          //如果是云端路径，则证明为已经上传过的照片
          for (let i = 0; i < image_number; i++) {
            if (that.data.imgs[i].substring(0, 5) == 'cloud') {
              image_arrList.push(that.data.imgs[i])
              image_numList.push(i)
            }
          }
          //如果是云端路径，则证明为已经上传过的文件
          for (let i = 0; i < file_number; i++) {
            if (that.data.file[i].path.substring(0, 5) == 'cloud') {
              file_arrList.push(that.data.file[i].path)
              file_numList.push(i)
            }
          }
          //对下标索引数组进行取反
          image_numList.reverse()
          //删除图片数组中的云端连接
          for (let i of image_numList) {
            that.data.imgs.splice(i, 1)
          }
          setTimeout(function () {
            //获取云端图片临时连接
            wx.cloud.getTempFileURL({
              fileList: image_arrList,
              success: res => {
                for (let i = 0; i < image_arrList.length; i++) {
                  that.data.url_image_List.push(res.fileList[i].tempFileURL)
                }
              },
              fail: err => {
                console.log("获取云端路径失败")
              }
            })
            //获取云端文件临时连接
            wx.cloud.getTempFileURL({
              fileList: file_arrList,
              success: res => {
                for (let i = 0; i < file_arrList.length; i++) {
                  that.data.url_file_List.push(res.fileList[i].tempFileURL)
                }
              },
              fail: err => {
                console.log("获取云端路径失败")
              }
            })
          }, 500)

          setTimeout(function () {
            //将云端路径转化为可上传的临时路径
            for (let i = 0; i < that.data.url_image_List.length; i++) {
              //将云端图片进行本地缓存
              wx.downloadFile({
                url: that.data.url_image_List[i],
                success: function (res) {
                  if (res.statusCode === 200) {
                    // 使用小程序的文件系统，通过小程序的api获取到全局唯一的文件管理器
                    const fs = wx.getFileSystemManager()
                    //fs为全局唯一的文件管理器，文件管理器的作用之一就是可以根据临时文件路径，通过saveFile把文件保存到本地缓存.
                    fs.saveFile({
                      tempFilePath: res.tempFilePath, // 传入一个临时文件路径
                      success(res) {
                        //此时图片本地缓存已经完成，res.savedFilePath为本地存储的路径
                        that.data.imgs.unshift(res.savedFilePath)
                      }
                    })
                  } else {
                    console.log('响应失败', res.statusCode)
                  }
                }
              })
            }

            //将云端文件路径转化为可上传的临时路径
            for (let i = 0; i < that.data.url_file_List.length; i++) {
              //将云端文件进行本地缓存
              wx.downloadFile({
                url: that.data.url_file_List[i],
                success: function (res) {
                  if (res.statusCode === 200) {
                    // 使用小程序的文件系统，通过小程序的api获取到全局唯一的文件管理器
                    const fs = wx.getFileSystemManager()
                    //fs为全局唯一的文件管理器，文件管理器的作用之一就是可以根据临时文件路径，通过saveFile把文件保存到本地缓存.
                    fs.saveFile({
                      tempFilePath: res.tempFilePath, // 传入一个临时文件路径
                      success(res) {
                        //此时文件本地缓存已经完成，res.savedFilePath为本地存储的路径
                        var index = file_numList[i]
                        that.data.file[index].path = res.savedFilePath
                      }
                    })
                  } else {
                    console.log('响应失败', res.statusCode)
                  }
                }
              })
            }
          }, 2000)

          //组装数据上传数据库
          for (let i = 0; i < image_number; i++) {
            picture.push(date + '_' + i)
          }
          //获得文件相关的属性
          var temFile = that.data.file
          var temFileList = [];
          for (let i = 0; i < that.data.file.length; i++) {
            temFile[i].name = date + '_' + i + '_' + temFile[i].name
            let postfix = temFile[i].postfix;
            let name = temFile[i].name;
            let path = temFile[i].path;
            temFileList.push({ postfix, name, path })
          }
          const db = wx.cloud.database();
          //更新数据库
          setTimeout(function () {
            db.collection('resource').doc(that.data.resourceItem._id).update({
              //data 传入需要局部更新的数据
              data: {
                title: that.data.title,
                content: that.data.content,
                tag: that.data.tag,
                date: date,
                commentList: that.data.resourceItem.commentList,
                imageList: picture,
                fileList: temFileList,
                type: that.data.type
              },
              success(res) {
                wx.showToast({
                  title: '修改成功',
                })
                //上传文件
                that.upload(date, that.data.resourceItem._id)
              },
              fail(res) {
                wx.showToast({
                  title: '修改失败',
                })
              }
            })
          }, 4000)



          setTimeout(function () {
            //删除之前的图片文件
            wx.cloud.deleteFile({
              fileList: that.data.old_image_List,
              success: res => {
                console.log('旧图片删除成功')
              },
              fail: console.error
            })

            //删除之前的文件
            wx.cloud.deleteFile({
              fileList: that.data.old_file_List,
              success: res => {
                console.log('旧文件删除成功')
              },
              fail: console.error
            })
            wx.hideLoading()
            wx.redirectTo({
              url: '/pages/info/MyPublish/MyPublish'
            })
          }, 7000) //延迟时间 这里是7秒
        }

        //添加操作
        if (that.data.update == 0) {
          var db = wx.cloud.database()
          var temFile = that.data.file
          var temFileList = [];
          var temImageList = [];
          var date = new Date().getTime();
          for (let i = 0; i < that.data.file.length; i++) {
            temFile[i].name = date + '_' + i + '_' + temFile[i].name
            let postfix = temFile[i].postfix;
            let name = temFile[i].name;
            let path = temFile[i].path;
            temFileList.push({ postfix, name, path })
          }
          for (let i = 0; i < that.data.imgs.length; i++) {
            temImageList.push(date + "_" + i);
          }
          that.setData({
            imageList: temImageList,
            fileList: temFileList
          })

          db.collection('resource').add({
            data: {
              title: that.data.title, //标题
              content: that.data.content, //内容
              tag: that.data.tag, //标签
              coin: 0,  //目前暂不使用，只是赋一个默认值
              date: new Date().getTime(), //发表日期
              commentList: [], //评论
              fileList: that.data.fileList, //文件列表
              imageList: that.data.imageList,//图片列表
              type: that.data.type,
              likeNum: 0,
            },
            success: res => {
              wx.showToast({
                title: '新增记录成功',
              })
              // that.setData(
              //   {
              //     ResourceID:res._id
              //   }
              // )
              that.upload(date, res._id)
            }
          })
          this.toResource()
        }
      }
    }
  }, 

  /**
   * 上传图片和文件
   */
  upload: function (date, questionid) {
    var that = this
    let imgs = that.data.imgs
    let file = that.data.file
    // let imageList = that.data.imageList
    // let fileList = that.data.fileList
    //上传图片
    imgs.forEach(function (element, index, array) {
      wx.cloud.uploadFile(
        {
          cloudPath: 'resource/' + questionid + '/image/' + date + "_" + index,
          filePath: element,
          success: res => {
            console.log("图片上传成功！")
          },
          fail: err => {
            // handle error
          }
        }
      )
    })

    //上传文件
    for (let x of file) {
      wx.cloud.uploadFile(
        {
          cloudPath: 'resource/' + questionid + '/file/' + x.name,
          filePath: x.path,
          success: res => {
            console.log("文件上传成功！")
          },
          fail: err => {
            // handle error
          }
        }
      )
    }
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  * 和图片有关各类操作
  */

  /**
  *选择图片
  */
  chooseImg() {
    let that = this;
    let len = this.data.imgs;
    if (len >= 9) {
      this.setData({
        lenMore: 1
      })
      return;
    }
    wx.chooseImage({
      success: (res) => {
        let tempFilePaths = res.tempFilePaths;
        let imgs = that.data.imgs;
        for (let i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length < 9) {
            imgs.push(tempFilePaths[i])
          } else {
            that.setData({
              imgs
            })
            $wuxToast().show({
              type: 'forbidden',
              duration: 1500,
              color: '#fff',
              text: '只能上传前9张图片',
              success: () => console.log('只能上传前9张图片')
            })
            return;
          }
        }
        that.setData({
          imgs
        })
      }
    })
  },

  /**
  *预览图片
  */
  previewImg(e) {
    let index = e.currentTarget.dataset.index;
    let imgs = this.data.imgs;
    wx.previewImage({
      current: imgs[index],
      urls: imgs,
    })
  },

  /**
  * 删除图片
  */
  deleteImg(e) {
    let _index = e.currentTarget.dataset.index;
    let imgs = this.data.imgs;
    imgs.splice(_index, 1);
    this.setData({
      imgs
    })
  },

  /**
  *-----------------------------------------------------------------------------------------------------
  * 和文件有关的各类操作
  */

  /**
   * 选择文件
   */
  chooseFile:function(e)
  {
    var that = this
    wx.chooseMessageFile({
      count : 3 - that.data.file.length,
      type:"file",
      success:res=>{
        let tempFiles = res.tempFiles;
        let file = that.data.file;
        for (let i = 0; i < tempFiles.length; i++)
        {
          tempFiles[i].postfix = tempFiles[i].name.substring(tempFiles[i].name.lastIndexOf(".") + 1, tempFiles[i].name.lastIndexOf(".") + 4)
          if (tempFiles[i].postfix === "doc" ||
              tempFiles[i].postfix === "file" ||
              tempFiles[i].postfix === "pdf" ||
              tempFiles[i].postfix === "ppt" ||
              tempFiles[i].postfix === "txt" ||
              tempFiles[i].postfix === "xls"){
              //空，什么也不做，只有后缀名为这些的文件才能上传
            }
            else
            {
              $wuxToast().show({
                type: 'cancel',
                duration: 1500,
                color: '#fff',
                text: '上传的文件中包含不支持的文件格式',
                success: () => console.log('上传的文件中包含不支持的文件格式')
              })
              return
            }
        }
        for (let i = 0; i < tempFiles.length; i++)
        {
          if (file.length < 3) {
            file.push(tempFiles[i])
          }
          else 
          {
            that.setData({
              file: file
            })
            $wuxToast().show({
              type: 'forbidden',
              duration: 1500,
              color: '#fff',
              text: '只能上传前3个文件',
              success: () => console.log('只能上传前3个文件')
            })
            return
          }
        }
        that.setData({
          file:file
        })
      }
    })
  },


  /**
   * 删除文件
   */
  deletefile:function(e)
  {
    let _index = e.currentTarget.dataset.index;
    let file = this.data.file;
    file.splice(_index, 1);
    this.setData({
      file
    })
  },

  /**
*-----------------------------------------------------------------------------------------------------
* 页面跳转各类操作
*/

  /**
  * 跳转回资源页面
  */
  toResource: function () {
    wx.switchTab({
      url: '/pages/resource/resource',
    })
  }
})