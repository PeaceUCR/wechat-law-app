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

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 10 },
        '第二章 宣传教育': { value: '第二章 宣传教育', start: 11, end: 18 },
        '第三章 毒品管制': { value: '第三章 毒品管制', start: 19, end: 30 },
        '第四章 戒毒措施': { value: '第四章 戒毒措施', start: 31, end: 52 },
        '第五章 国际合作': { value: '第五章 国际合作', start: 53, end: 58 },
        '第六章 法律责任': { value: '第六章 法律责任', start: 59, end: 70 },
        '第七章 附则': { value: '第七章 附则', start: 71, end: 71 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('anti-drug-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('anti-drug-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('anti-drug-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
