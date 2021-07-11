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
        '第二章 受案范围': { value: '第二章 受案范围', start: 12, end: 13 },
        '第三章 管辖': { value: '第三章 管辖', start: 14, end: 24 },
        '第四章 诉讼参加人': { value: '第四章 诉讼参加人', start: 25, end: 32 },
        '第五章 证据': { value: '第五章 证据', start: 33, end: 43 },
        '第六章 起诉和受理': { value: '第六章 起诉和受理', start: 44, end: 53 },
        '第七章 审理和判决': { value: '第七章 审理和判决', start: 54, end: 93 },
        '第一节 一般规定': { value: '第一节 一般规定', start: 54, end: 66 },
        '第二节 第一审普通程序': { value: '第二节 第一审普通程序', start: 67, end: 81 },
        '第三节 简易程序': { value: '第三节 简易程序', start: 82, end: 84 },
        '第四节 第二审程序': { value: '第四节 第二审程序', start: 85, end: 89 },
        '第五节 审判监督程序': { value: '第五节 审判监督程序', start: 90, end: 93 },
        '第八章 执行': { value: '第八章 执行', start: 94, end: 97 },
        '第九章 涉外行政诉讼': { value: '第九章 涉外行政诉讼', start: 98, end: 100 },
        '第十章 附则': { value: '第十章 附则', start: 101, end: 103 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('admin-litigation-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('admin-litigation-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('admin-litigation-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
