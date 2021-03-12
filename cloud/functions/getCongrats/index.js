 const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext();
  const db = cloud.database()

  const countVisit = await db.collection('congrats').where({
    type: 'visit'
  }).count()
  const countSend = await db.collection('congrats').where({
    type: 'send'
  }).count()
  const sends = await db.collection('congrats').where({
    type: 'send'
  }).orderBy('time', 'asc').get();

  return {
    countVisit,
    countSend,
    sends
  }
}
