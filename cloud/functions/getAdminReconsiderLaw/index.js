const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    console.log(event)
    const db = cloud.database()
    const _ = db.command

    const type = event.type
    const searchValue = event.searchValue

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 5 },
        '第二章 行政复议范围': { value: '第二章 行政复议范围', start: 6, end: 8 },
        '第三章 行政复议申请': { value: '第三章 行政复议申请', start: 9, end: 16 },
        '第四章 行政复议受理': { value: '第四章 行政复议受理', start: 17, end: 21 },
        '第五章 行政复议决定': { value: '第五章 行政复议决定', start: 22, end: 33 },
        '第六章 法律责任': { value: '第六章 法律责任', start: 34, end: 38 },
        '第七章 附则': { value: '第七章 附则', start: 39, end: 43 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('admin-reconsider-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('admin-reconsider-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('admin-reconsider-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
