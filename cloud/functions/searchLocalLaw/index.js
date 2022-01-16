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

  const {province, city, searchValue} = event

  const regexpSearchValue = '.*' + searchValue
  const regexpProvince = '.*' + province.replace('省','')
  const regexpCity = '.*' + city.replace('市','')

  return await db.collection('local-law').where(_.and([
    {
      title: db.RegExp({
        regexp: regexpSearchValue,
        options: 'i'
      })
    },
    _.or([
      {
        title: db.RegExp({
          regexp: regexpProvince,
          options: 'i'
        })
      },
      {
        title: db.RegExp({
          regexp: regexpCity,
          options: 'i'
        })
      },
    ])
  ])).limit(100).get()

}
