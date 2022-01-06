 const cloud = require('wx-server-sdk')
 const moment = require('moment')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  const db = cloud.database()
  const _ = db.command

  const {url} = event

  const today = moment().format('YYYY-MM-DD')

  const {total} = await db.collection('share').where({
    openId,
    today
  }).count()

  if (total < 1) {
    await db.collection('user').where({
      //下面这3行，为筛选条件
      openId
    }).update({
      data: {
        score: _.inc(1),
        lastTimeLogin: new Date()
      }
    });
  }

  return await db.collection('share').add({
    data: {
      openId,
      url,
      today
    }
  })
}
