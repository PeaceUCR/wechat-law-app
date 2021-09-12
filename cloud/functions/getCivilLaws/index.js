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
      return await db.collection('civil-law').where({text: db.RegExp({
            regexp: regexpString,
            options: 'i',
        })}).orderBy('numberIndex', 'asc').limit(1000).get()
  } else if (type === '搜序号') {
    return await db.collection('civil-law').where({number: db.RegExp({
        regexp: '.*' + searchValue,
        options: 'i',
      })}).orderBy('numberIndex', 'asc').limit(1000).get()
  } else if (type === '搜条旨') {
      return await db.collection('civil-law').where({tag: db.RegExp({
              regexp: '.*' + searchValue,
              options: 'i',
          })}).orderBy('numberIndex', 'asc').limit(1000).get()
  }

  return await db.collection('civil-law').where({text: db.RegExp({
            regexp: '.*' + searchValue,
            options: 'i',
        })}).orderBy('numberIndex', 'asc').limit(1000).get()
}
