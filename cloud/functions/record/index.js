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

  if (event.type === 'recognize') {
    return await db.collection("recognize").add({
      data: {
        openId: wxContext.OPENID,//获取操作者_openid的方法
        nickName: event.nickName,
        time: new Date()
      }
    })
  }

  const {location} = event
  if (location) {
    const {province, city} = location
    return await db.collection('user').where({
      //下面这3行，为筛选条件
      openId
    }).update({
      data: {
        province,
        city,
        lastTimeLogin: new Date()
      }
    })
  }

  const today = moment().format('YYYY-MM-DD')
  await db.collection('visit').add({
    data: {
      openId,
      today
    }
  })
  const {total} = await db.collection('visit').where({
    openId,
    today
  }).count()

  if (total < 1) {
    return await db.collection('user').where({
      //下面这3行，为筛选条件
      openId
    }).update({
      data: {
        score: _.inc(1),
        lastTimeLogin: new Date()
      }
    });
  } else {
    return await db.collection('user').where({
      //下面这3行，为筛选条件
      openId
    }).update({
      data: {
        lastTimeLogin: new Date()
      }
    });
  }

}
