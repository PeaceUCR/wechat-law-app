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

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 7 },
        '第二章 车辆和驾驶人': { value: '第二章 车辆和驾驶人', start: 8, end: 24 },
        '第一节 机动车、非机动车': { value: '第一节 机动车、非机动车', start: 8, end: 18 },
        '第二节 机动车驾驶人': { value: '第二节 机动车驾驶人', start: 19, end: 24 },
        '第三章 道路通行条件': { value: '第三章 道路通行条件', start: 25, end: 34 },
        '第四章 道路通行规定': { value: '第四章 道路通行规定', start: 35, end: 69 },
        '第一节 一般规定': { value: '第一节 一般规定', start: 35, end: 41 },
        '第二节 机动车通行规定': { value: '第二节 机动车通行规定', start: 42, end: 56 },
        '第三节 非机动车通行规定': { value: '第三节 非机动车通行规定', start: 57, end: 60 },
        '第四节 行人和乘车人通行规定': { value: '第四节 行人和乘车人通行规定', start: 61, end: 66 },
        '第五节 高速公路的特别规定': { value: '第五节 高速公路的特别规定', start: 67, end: 69 },
        '第五章 交通事故处理': { value: '第五章 交通事故处理', start: 70, end: 77 },
        '第六章 执法监督': { value: '第六章 执法监督', start: 78, end: 86 },
        '第七章 法律责任': { value: '第七章 法律责任', start: 87, end: 118 },
        '第八章 附则': { value: '第八章 附则', start: 119, end: 124 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('road-safe-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('road-safe-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('road-safe-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
