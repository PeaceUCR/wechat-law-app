const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext();
  const db = cloud.database()
  const _ = db.command

  const type = event.type
  const searchValue = event.searchValue

  let result, result1, result2, result3;

  if (type === 'criminal-detail') {
    result = await db.collection('consult').limit(1000).where({
      number: _.in([...searchValue])
    }).orderBy('number', 'desc').get();

  } else if (type === 'all') {
    const regexpString1 = `${searchValue.split('').join('.*')}`
    const regexpString2 = `.*${searchValue}`

    // around match
    result1 = await db.collection('consult').limit(1000).where({
      text: db.RegExp({
        regexp: regexpString1,
        options: 'i',
      })
    }).orderBy('number', 'desc').get();

    // exact match
    result2 = await db.collection('consult').limit(1000).where({
      text: db.RegExp({
        regexp: regexpString2,
        options: 'i',
      })
    }).orderBy('number', 'desc').get();

    // exact match title
    result3 = await db.collection('consult').limit(1000).where({
      title: db.RegExp({
        regexp: regexpString2,
        options: 'i',
      })
    }).orderBy('number', 'desc').get();


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


  } else if (type === 'number') {
    result = await db.collection('consult').limit(1000).where({
      number: parseInt(event.number)
    }).orderBy('number', 'desc').get();

  } else {
    result = await db.collection('consult').limit(1000).where({title: db.RegExp({
        regexp: '.*' + event.name,
        options: 'i',
      })}).orderBy('number', 'desc').get();
  }
  result.data.forEach(r => {
    delete r.content
    delete r.text
  })
  return {
    result
  }
}
