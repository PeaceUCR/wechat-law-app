const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    console.log(event)
    const db = cloud.database()

    const {searchValue, type} = event

    if (type === 'all') {
        return await db.collection('2022-civil-law-regulation')
            .orderBy('number', 'asc').limit(1000).get()
    }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('2022-civil-law-regulation')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('2022-civil-law-regulation')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
