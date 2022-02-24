const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext();
  const db = cloud.database()

  const specialSet = new Set(["admin-criminal-link", "appeal", "supervision"])

  const {isCategory, searchValue, type} = event

  if (isCategory === true && specialSet.has(type)) {
    return await db.collection('complement').limit(1000).where({
      type
    }).get()
  }

  if (type === "all-initial") {
    return await db.collection('complement').limit(20).orderBy('effectiveDate', 'desc').get();
  }

  let result

  const regexpString1 = `${searchValue.split('').join('.*')}`
  const regexpString2 = `.*${searchValue}`
  // around match
  let result1 = await db.collection('complement').limit(1000).where({
    text: searchValue ? db.RegExp({
      regexp: regexpString1,
      options: 'i',
    }) : undefined,
    type: specialSet.has(type) ? type : undefined
  }).orderBy('effectiveDate', 'desc').get();

  // exact match
  let result2 = await db.collection('complement').limit(1000).where({
    text: searchValue ? db.RegExp({
      regexp: regexpString2,
      options: 'i',
    }) : undefined,
    type: specialSet.has(type) ? type : undefined
  }).orderBy('effectiveDate', 'desc').get();

  // exact match By title
  let result3 = await db.collection('complement').limit(1000).where({
    title: searchValue ? db.RegExp({
      regexp: regexpString2,
      options: 'i',
    }) : undefined,
    type: specialSet.has(type) ? type : undefined
  }).orderBy('effectiveDate', 'desc').get();

  const allId = new Set([])
  result3.data.forEach(item => item.exactMatch = true)
  result2.data.forEach(item => item.exactMatch = true)
  result1.data.forEach(item => item.exactMatch = false)

  const all = [...result3.data, ...result2.data, ...result1.data]
  const allUnique = []

  all.forEach(item => {
    if (allId.has(item._id)) {

    } else {
      allUnique.push(item)
      allId.add(item._id)
    }
  })


  result = {
    data: allUnique
  }

  if (!specialSet.has(type)) {
    result.data.forEach(r => {
      delete r.content
      delete r.text
    })
  }

  return {
    result
  }
}
