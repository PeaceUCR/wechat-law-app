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


  if (type === '搜全文') {
    const regexpString = `${searchValue.split('').join('.*')}`
    return await db.collection('terms').where({text: db.RegExp({
            regexp: regexpString,
            options: 'i',
        })}).orderBy('number', 'asc').limit(1000).get()
  } else if (type === '搜序号') {
    return await db.collection('terms').where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
  } else if (type === '搜罪名') {
      return await db.collection('terms').where({crime: db.RegExp({
              regexp: '.*' + searchValue,
              options: 'i',
          })}).orderBy('number', 'asc').limit(1000).get()
  }

  const regexpString = `${searchValue.split('').join('.*')}`
  return await db.collection('terms').where({text: db.RegExp({
          regexp: regexpString,
          options: 'i',
      })}).orderBy('number', 'asc').limit(1000).get()
}
