// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("调用了addDataToDB云函数")

  return await db.collection(event.collectionName).add({
    data: {
      _openid:event._openid,
      title: event.title,
      content: event.content,
      tag: event.tag,
      coin: event.coin,
      date: new Date().getTime(),
      commentList: [],
      imageList: event.imageList,
      fileList: event.imageList,
    },
  })
}