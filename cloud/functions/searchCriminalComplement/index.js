const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext();
  const db = cloud.database()

  const {isCategory, searchValue, type} = event

  if (isCategory && type === "admin-criminal-link") {
    return await db.collection('complement').limit(1000).where({
      type: "admin-criminal-link"
    }).get()
  }

  let result

  const regexpString1 = `${searchValue.split('').join('.*')}`
  const regexpString2 = `.*${searchValue}`
  let result1 = await db.collection('complement').limit(1000).where({
    text: searchValue ? db.RegExp({
      regexp: regexpString1,
      options: 'i',
    }) : undefined,
    type: type === "admin-criminal-link" ? "admin-criminal-link" : undefined
  }).orderBy('effectiveDate', 'desc').get();

  // exact match
  let result2 = await db.collection('complement').limit(1000).where({
    text: searchValue ? db.RegExp({
      regexp: regexpString2,
      options: 'i',
    }) : undefined,
    type: type === "admin-criminal-link" ? "admin-criminal-link" : undefined
  }).orderBy('effectiveDate', 'desc').get();

  const exist = new Set(result2.data.map(item => item._id))
  const complement = result1.data.filter(item => !exist.has(item._id))

  let result2Flag = result2.data.map(item => {
    item.exactMatch = true
    return item;
  })
  let complementFlag = complement.map(item => {
    item.exactMatch = false
    return item
  })

  result = {
    data: [...result2Flag, ...complementFlag]
  }

  if (type !== "admin-criminal-link") {
    result.data.forEach(r => {
      delete r.content
      delete r.text
    })
  }

  return {
    result
  }
}
