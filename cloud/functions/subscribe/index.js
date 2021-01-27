 const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  const db = cloud.database()

  return await db.collection("subscription").add({
    data: {
      openId: openId,//获取操作者_openid的方法
      time: new Date()
    }
  })
  //
  // return {
  //   openid: wxContext.OPENID
  // }
}
