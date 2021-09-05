const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// search Court Open Examples
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database()
  const _ = db.command;

  const type = event.type
  const searchValue = event.searchValue

  const regexpString1 = `${searchValue.split('').join('.*')}`
  const regexpString2 = `.*${searchValue}`

  result1 = await db.collection('example').where({
    text: db.RegExp({
      regexp: regexpString1,
      options: 'i',
    })}).limit(1000).get();

  // exact match
  result2 = await db.collection('example').where({
    text: db.RegExp({
      regexp: regexpString2,
      options: 'i',
    })}).limit(1000).get();

  const exist = new Set(result2.data.map(item => item._id))
  const complement = result1.data.filter(item => !exist.has(item._id))

  result2Flag = result2.data.map(item => {
    item.exactMatch = true
    return item;
  })
  complementFlag = complement.map(item => {
    item.exactMatch = false
    return item
  })

  const searchResult = [...result2Flag, ...complementFlag].map(e => {
    delete e.content
    delete e.text
    return e
  })

  return {
    searchResult
  }
}
