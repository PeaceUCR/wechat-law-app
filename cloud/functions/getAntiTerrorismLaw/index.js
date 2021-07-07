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

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 11 },
        '第二章 恐怖活动组织和人员的认定': { value: '第二章 恐怖活动组织和人员的认定', start: 12, end: 16 },
        '第三章 安全防范': { value: '第三章 安全防范', start: 17, end: 42 },
        '第四章 情报信息': { value: '第四章 情报信息', start: 43, end: 48 },
        '第五章 调查': { value: '第五章 调查', start: 49, end: 54 },
        '第六章 应对处置': { value: '第六章 应对处置', start: 55, end: 67 },
        '第七章 国际合作': { value: '第七章 国际合作', start: 68, end: 72 },
        '第八章 保障措施': { value: '第八章 保障措施', start: 73, end: 78 },
        '第九章 法律责任': { value: '第九章 法律责任', start: 79, end: 96 },
        '第十章 附则': { value: '第十章 附则', start: 97, end: 97 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('anti-terrorism-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('anti-terrorism-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('anti-terrorism-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
