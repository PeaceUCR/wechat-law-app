

const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const db = cloud.database()

  const searchValue = event.searchValue
  return await db.collection('procuratorate-doc').where({text: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
      })})
      .orderBy('time', 'desc').limit(1000).get();

}
