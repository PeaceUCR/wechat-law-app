const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const db = cloud.database()

  const type = event.type
  const searchValue = event.searchValue

  if (type === 'chapter') {
    return await db.collection('litigation-regulation').where({chapter: db.RegExp({
        regexp: '.*' + searchValue,
        options: 'i',
      })}).orderBy('number', 'asc').limit(1000).get()
  } else if (type === 'section') {
    return await db.collection('litigation-regulation').where({section: db.RegExp({
        regexp: '.*' + searchValue,
        options: 'i',
      })}).orderBy('number', 'asc').limit(1000).get()
  }
  return await db.collection('litigation-regulation')
      .where({content: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).orderBy('number', 'asc').limit(1000).get()


}
