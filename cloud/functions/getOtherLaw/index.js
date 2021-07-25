const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const lawMap = {
    'civil-litigation-explanation': { '一、管辖': { value: '一、管辖', start: 1, end: 42 },
        '二、回避': { value: '二、回避', start: 43, end: 49 },
        '三、诉讼参加人': { value: '三、诉讼参加人', start: 50, end: 89 },
        '四、证据': { value: '四、证据', start: 90, end: 124 },
        '五、期间和送达': { value: '五、期间和送达', start: 125, end: 141 },
        '六、调解': { value: '六、调解', start: 142, end: 151 },
        '七、保全和先予执行': { value: '七、保全和先予执行', start: 152, end: 173 },
        '八、对妨害民事诉讼的强制措施': { value: '八、对妨害民事诉讼的强制措施', start: 174, end: 193 },
        '九、诉讼费用': { value: '九、诉讼费用', start: 194, end: 207 },
        '十、第一审普通程序': { value: '十、第一审普通程序', start: 208, end: 155 },
        '十一、简易程序': { value: '十一、简易程序', start: 256, end: 270 },
        '十二、简易程序中的小额诉讼': { value: '十二、简易程序中的小额诉讼', start: 271, end: 283 },
        '十三、公益诉讼': { value: '十三、公益诉讼', start: 284, end: 291 },
        '十四、第三人撤销之诉': { value: '十四、第三人撤销之诉', start: 292, end: 303 },
        '十五、执行异议之诉': { value: '十五、执行异议之诉', start: 304, end: 316 },
        '十六、第二审程序': { value: '十六、第二审程序', start: 317, end: 342 },
        '十七、特别程序': { value: '十七、特别程序', start: 343, end: 374 },
        '十八、审判监督程序': { value: '十八、审判监督程序', start: 375, end: 426 },
        '十九、督促程序': { value: '十九、督促程序', start: 427, end: 443 },
        '二十、公示催告程序': { value: '二十、公示催告程序', start: 444, end: 461 },
        '二十一、执行程序': { value: '二十一、执行程序', start: 462, end: 521 },
        '二十二、涉外民事诉讼程序的特别规定': { value: '二十二、涉外民事诉讼程序的特别规定', start: 522, end: 551 },
        '二十三、附则': { value: '二十三、附则', start: 552, end: 552 } },
    'criminal-litigation-explanation': { '第一章 管辖': { value: '第一章 管辖', start: 1, end: 26 },
        '第二章 回避': { value: '第二章 回避', start: 27, end: 39 },
        '第三章 辩护与代理': { value: '第三章 辩护与代理', start: 40, end: 68 },
        '第四章 证据': { value: '第四章 证据', start: 69, end: 146 },
        '第一节 一般规定': { value: '第一节 一般规定', start: 546, end: 562 },
        '第二节 物证、书证的审查与认定': { value: '第二节 物证、书证的审查与认定', start: 82, end: 86 },
        '第三节 证人证言、被害人陈述的审查与认定': { value: '第三节 证人证言、被害人陈述的审查与认定', start: 87, end: 92 },
        '第四节 被告人供述和辩解的审查与认定': { value: '第四节 被告人供述和辩解的审查与认定', start: 93, end: 96 },
        '第五节 鉴定意见的审查与认定': { value: '第五节 鉴定意见的审查与认定', start: 97, end: 101 },
        '第六节 勘验、检查、辨认、侦查实验等笔录的审查与认定':
            { value: '第六节 勘验、检查、辨认、侦查实验等笔录的审查与认定', start: 102, end: 107 },
        '第七节 视听资料、电子数据的审查与认定': { value: '第七节 视听资料、电子数据的审查与认定', start: 108, end: 115 },
        '第八节 技术调查、侦查证据的审查与认定': { value: '第八节 技术调查、侦查证据的审查与认定', start: 116, end: 122 },
        '第九节 非法证据排除': { value: '第九节 非法证据排除', start: 123, end: 138 },
        '第十节 证据的综合审查与运用': { value: '第十节 证据的综合审查与运用', start: 139, end: 146 },
        '第五章 强制措施': { value: '第五章 强制措施', start: 147, end: 174 },
        '第六章 附带民事诉讼': { value: '第六章 附带民事诉讼', start: 175, end: 201 },
        '第七章 期间、送达、审理期限': { value: '第七章 期间、送达、审理期限', start: 202, end: 211 },
        '第八章 审判组织': { value: '第八章 审判组织', start: 212, end: 217 },
        '第九章 公诉案件第一审普通程序': { value: '第九章 公诉案件第一审普通程序', start: 218, end: 315 },
        '第一节 审查受理与庭前准备': { value: '第一节 审查受理与庭前准备', start: 218, end: 225 },
        '第二节 庭前会议与庭审衔接': { value: '第二节 庭前会议与庭审衔接', start: 226, end: 233 },
        '第三节 宣布开庭与法庭调查': { value: '第三节 宣布开庭与法庭调查', start: 234, end: 279 },
        '第四节 法庭辩论与最后陈述': { value: '第四节 法庭辩论与最后陈述', start: 280, end: 290 },
        '第五节 评议案件与宣告判决': { value: '第五节 评议案件与宣告判决', start: 291, end: 304 },
        '第六节 法庭纪律与其他规定': { value: '第六节 法庭纪律与其他规定', start: 305, end: 315 },
        '第十章 自诉案件第一审程序': { value: '第十章 自诉案件第一审程序', start: 316, end: 334 },
        '第十一章 单位犯罪案件的审理': { value: '第十一章 单位犯罪案件的审理', start: 335, end: 346 },
        '第十二章 认罪认罚案件的审理': { value: '第十二章 认罪认罚案件的审理', start: 347, end: 358 },
        '第十三章 简易程序': { value: '第十三章 简易程序', start: 359, end: 368 },
        '第十四章 速裁程序': { value: '第十四章 速裁程序', start: 369, end: 377 },
        '第十五章 第二审程序': { value: '第十五章 第二审程序', start: 378, end: 413 },
        '第十六章 在法定刑以下判处刑罚和特殊假释的核准': { value: '第十六章 在法定刑以下判处刑罚和特殊假释的核准', start: 414, end: 422 },
        '第十七章 死刑复核程序': { value: '第十七章 死刑复核程序', start: 423, end: 436 },
        '第十八章 涉案财物处理': { value: '第十八章 涉案财物处理', start: 437, end: 450 },
        '第十九章 审判监督程序': { value: '第十九章 审判监督程序', start: 451, end: 474 },
        '第二十章 涉外刑事案件的审理和刑事司法协助': { value: '第二十章 涉外刑事案件的审理和刑事司法协助', start: 475, end: 496 },
        '第一节 涉外刑事案件的审理': { value: '第一节 涉外刑事案件的审理', start: 475, end: 490 },
        '第二节 刑事司法协助': { value: '第二节 刑事司法协助', start: 491, end: 496 },
        '第二十一章 执行程序': { value: '第二十一章 执行程序', start: 497, end: 545 },
        '第一节 死刑的执行': { value: '第一节 死刑的执行', start: 497, end: 510 },
        '第二节 死刑缓期执行、无期徒刑、有期徒刑、拘役的交付执行':
            { value: '第二节 死刑缓期执行、无期徒刑、有期徒刑、拘役的交付执行', start: 511, end: 518 },
        '第三节 管制、缓刑、剥夺政治权利的交付执行': { value: '第三节 管制、缓刑、剥夺政治权利的交付执行', start: 519, end: 520 },
        '第四节 刑事裁判涉财产部分和附带民事裁判的执行': { value: '第四节 刑事裁判涉财产部分和附带民事裁判的执行', start: 521, end: 532 },
        '第五节 减刑、假释案件的审理': { value: '第五节 减刑、假释案件的审理', start: 533, end: 541 },
        '第六节 缓刑、假释的撤销': { value: '第六节 缓刑、假释的撤销', start: 542, end: 545 },
        '第二十二章 未成年人刑事案件诉讼程序': { value: '第二十二章 未成年人刑事案件诉讼程序', start: 546, end: 586 },
        '第二节 开庭准备': { value: '第二节 开庭准备', start: 563, end: 570 },
        '第三节 审判': { value: '第三节 审判', start: 571, end: 579 },
        '第四节 执行': { value: '第四节 执行', start: 580, end: 586 },
        '第二十三章 当事人和解的公诉案件诉讼程序': { value: '第二十三章 当事人和解的公诉案件诉讼程序', start: 587, end: 597 },
        '第二十四章 缺席审判程序': { value: '第二十四章 缺席审判程序', start: 598, end: 608 },
        '第二十五章 犯罪嫌疑人、被告人逃匿、死亡案件违法所得的没收程序':
            { value: '第二十五章 犯罪嫌疑人、被告人逃匿、死亡案件违法所得的没收程序',
                start: 609,
                end: 629 },
        '第二十六章 依法不负刑事责任的精神病人的强制医疗程序':
            { value: '第二十六章 依法不负刑事责任的精神病人的强制医疗程序', start: 630, end: 649 },
        '第二十七章 附则': { value: '第二十七章 附则', start: 650, end: 655 } },
    'road-safe-violation-handling': { '第一章 总则': { value: '第一章 总则', start: 1, end: 3 },
        '第二章 管辖': { value: '第二章 管辖', start: 4, end: 6 },
        '第三章 调查取证': { value: '第三章 调查取证', start: 7, end: 23 },
        '第一节 一般规定': { value: '第一节 一般规定', start: 7, end: 14 },
        '第二节 交通技术监控': { value: '第二节 交通技术监控', start: 15, end: 23 },
        '第四章 行政强制措施适用': { value: '第四章 行政强制措施适用', start: 24, end: 41 },
        '第五章 行政处罚': { value: '第五章 行政处罚', start: 42, end: 62 },
        '第一节 行政处罚的决定': { value: '第一节 行政处罚的决定', start: 42, end: 58 },
        '第二节 行政处罚的执行': { value: '第二节 行政处罚的执行', start: 59, end: 62 },
        '第六章 执法监督': { value: '第六章 执法监督', start: 63, end: 66 },
        '第七章 其他规定': { value: '第七章 其他规定', start: 67, end: 76 },
        '第八章 附则': { value: '第八章 附则', start: 77, end: 83 } }
}

exports.main = async (event, context) => {
    console.log(event)
    const db = cloud.database()
    const _ = db.command

    const {type, law, searchValue}= event

    const numberMap = lawMap[law]

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('other-law')
            .where({
                number: parseInt(searchValue),
                type: law
            }).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('other-law').where({
            number: _.and(_.gte(start),_.lte(end)),
            type: law
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('other-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            }),
            type: law
        }).orderBy('number', 'asc').limit(1000).get()


}
