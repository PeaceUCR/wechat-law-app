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
        '第二章 行政强制的种类和设定': { value: '第二章 行政强制的种类和设定', start: 9, end: 15 },
        '第三章 行政强制措施实施程序': { value: '第三章 行政强制措施实施程序', start: 16, end: 33 },
        '第一节 一般规定': { value: '第一节 一般规定', start: 34, end: 44 },
        '第二节 查封、扣押': { value: '第二节 查封、扣押', start: 22, end: 28 },
        '第三节 冻结': { value: '第三节 冻结', start: 29, end: 33 },
        '第四章 行政机关强制执行程序': { value: '第四章 行政机关强制执行程序', start: 34, end: 52 },
        '第二节 金钱给付义务的执行': { value: '第二节 金钱给付义务的执行', start: 45, end: 49 },
        '第三节 代履行': { value: '第三节 代履行', start: 50, end: 52 },
        '第五章 申请人民法院强制执行': { value: '第五章 申请人民法院强制执行', start: 53, end: 60 },
        '第六章 法律责任': { value: '第六章 法律责任', start: 61, end: 68 },
        '第七章 附则': { value: '第七章 附则', start: 69, end: 71 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('admin-force-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('admin-force-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('admin-force-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
