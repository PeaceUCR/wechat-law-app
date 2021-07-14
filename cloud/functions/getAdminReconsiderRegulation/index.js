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

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 4 },
        '第二章 行政复议申请': { value: '第二章 行政复议申请', start: 5, end: 26 },
        '第一节 申请人': { value: '第一节 申请人', start: 5, end: 10 },
        '第二节 被申请人': { value: '第二节 被申请人', start: 11, end: 14 },
        '第三节 行政复议申请期限': { value: '第三节 行政复议申请期限', start: 15, end: 17 },
        '第四节 行政复议申请的提出': { value: '第四节 行政复议申请的提出', start: 18, end: 26 },
        '第三章 行政复议受理': { value: '第三章 行政复议受理', start: 27, end: 31 },
        '第四章 行政复议决定': { value: '第四章 行政复议决定', start: 32, end: 52 },
        '第五章 行政复议指导和监督': { value: '第五章 行政复议指导和监督', start: 53, end: 61 },
        '第六章 法律责任': { value: '第六章 法律责任', start: 62, end: 65 },
        '第七章 附则': { value: '第七章 附则', start: 66, end: 66 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('admin-reconsider-regulation')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('admin-reconsider-regulation').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('admin-reconsider-regulation')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
