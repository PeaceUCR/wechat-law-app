const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    console.log(event)
    const db = cloud.database()
    const _ = db.command

    const limit = 100

    const {searchValue, province, city} = event
    const regexpSearchValue = '.*' + searchValue

    if (province && city) {
        const regexpProvince = '.*' + province.replace('省','')
        const regexpCity = '.*' + city.replace('市','')

        const cityResult = await db.collection('procuratorate-doc').where(_.and([
            {
                text: db.RegExp({
                    regexp: regexpSearchValue,
                    options: 'i'
                })
            },
            {
                location: db.RegExp({
                    regexp: regexpCity,
                    options: 'i'
                })
            }
        ])).orderBy('time', 'desc').limit(limit).get()
        if (cityResult.data.length > 2) {
            return cityResult
        }
        const provinceResult = await db.collection('procuratorate-doc').where(_.and([
            {
                text: db.RegExp({
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
        ])).orderBy('time', 'desc').limit(limit).get()
        if (provinceResult.data.length > 0) {
            return provinceResult
        }
    }

    return await db.collection('procuratorate-doc').where({
        text: db.RegExp({
            regexp: regexpSearchValue,
            options: 'i'
        })
    }).orderBy('time', 'desc').limit(limit).get()
}
