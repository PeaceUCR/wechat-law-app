const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    console.log(event)
    const db = cloud.database()
    const _ = db.command

    const {searchValue, province, city, limit} = event
    const regexpSearchValue = '.*' + searchValue
    const regexpProvince = '.*' + province
    const regexpCity = '.*' + city

    return await db.collection('procuratorate-doc').where(_.and([
        {
            title: db.RegExp({
                regexp: regexpSearchValue,
                options: 'i'
            })
        },
        _.or([
            {
                location: db.RegExp({
                    regexp: regexpProvince,
                    options: 'i'
                })
            },
            {
                location: db.RegExp({
                    regexp: regexpCity,
                    options: 'i'
                })
            },
        ])
    ])).orderBy('time', 'desc').limit(limit ? limit : 1000).get()
}
