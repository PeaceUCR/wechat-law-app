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

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 8 },
        '第二章 行政处罚的种类和设定': { value: '第二章 行政处罚的种类和设定', start: 9, end: 16 },
        '第三章 行政处罚的实施机关': { value: '第三章 行政处罚的实施机关', start: 17, end: 21 },
        '第四章 行政处罚的管辖和适用': { value: '第四章 行政处罚的管辖和适用', start: 22, end: 38 },
        '第五章 行政处罚的决定': { value: '第五章 行政处罚的决定', start: 39, end: 65 },
        '第一节 一般规定': { value: '第一节 一般规定', start: 39, end: 50 },
        '第二节 简易程序': { value: '第二节 简易程序', start: 51, end: 53 },
        '第三节 普通程序': { value: '第三节 普通程序', start: 54, end: 62 },
        '第四节 听证程序': { value: '第四节 听证程序', start: 63, end: 65 },
        '第六章 行政处罚的执行': { value: '第六章 行政处罚的执行', start: 66, end: 75 },
        '第七章 法律责任': { value: '第七章 法律责任', start: 76, end: 83 },
        '第八章 附则': { value: '第八章 附则', start: 84, end: 86 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('admin-punish-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('admin-punish-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('admin-punish-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
