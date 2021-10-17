 const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const today = new Date().toLocaleDateString()

  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  const db = cloud.database()
  const _ = db.command

  const token =
      '24.22b925bd6e7371b892517cb45afc17b1.2592000.1637040869.282335-24304397'

  const r = await db.collection("recognize").where({
    openId,
    time: _.and(_.gte(new Date(today+" 00:00:00")),_.lte(new Date(today+" 23:59:59")))
  }).get()

  return {
    token,
    data: r.data
  }
}
