const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    // const categoryList = [
    //     {
    //         title:'',
    //         number: 128,
    //         start: 1415,
    //         end: 1433
    //     },
    //     {
    //         title:'认罪认罚专题',
    //         number: 127,
    //         start: 1403,
    //         end: 1414
    //     },{
    //         number: 125,
    //         start: 1387,
    //         end: 1402
    //     },{
    //         number: 124,
    //         start: 1364,
    //         end: 1386
    //     },{
    //         title: '办理扫黑除恶刑事案件专辑',
    //         number: 123,
    //         start: 1354,
    //         end: 1363
    //     },{
    //         number: 122,
    //         start: 1334,
    //         end: 1353
    //     },{
    //         title: '依法惩处妨害疫情防控犯罪专辑',
    //         number: 121,
    //         start: 1314,
    //         end: 1333
    //     },{
    //         number: 120,
    //         start: 1297,
    //         end: 1313
    //     },{
    //         number: 117,
    //         start: 1283,
    //         end: 1296
    //     },{
    //         title:'组织、强迫、引诱、容留、介绍卖淫专栏',
    //         number: 115,
    //         start: 1267,
    //         end: 1282
    //     },{
    //         number: 114,
    //         start: 1251,
    //         end: 1266
    //     },{
    //         number: 113,
    //         start: 1238,
    //         end: 1250
    //     },{
    //         number: 112,
    //         start: 1220,
    //         end: 1235
    //     },{
    //         number: 111,
    //         start: 1205,
    //         end: 1219
    //     },{
    //         title:'毒品案犯罪案件专题',
    //         number: 110,
    //         start: 1193,
    //         end: 1204
    //     },{
    //         title:'抢劫犯罪案件专题',
    //         number: 109,
    //         start: 1180,
    //         end: 1192
    //     },{
    //         title:'非法证据排除专题',
    //         number: 108,
    //         start: 1164,
    //         end: 1179
    //     },{
    //         title: '办理黑社会性质组织犯罪案件专辑',
    //         number: 107,
    //         start: 1152,
    //         end: 1163
    //     },{
    //         title: '办理贪污贿赂刑事案件专刊',
    //         number: 106,
    //         start: 1136,
    //         end: 1151
    //     },{
    //         title: '',
    //         number: 105,
    //         start: 1116,
    //         end: 1135
    //     },{
    //         title: '',
    //         number: 104,
    //         start: 1090,
    //         end: 1115
    //     },{
    //         title: '',
    //         number: 103,
    //         start: 1072,
    //         end: 1089
    //     },{
    //         title: '',
    //         number: 102,
    //         start: 1055,
    //         end: 1071
    //     },{
    //         title: '',
    //         number: 101,
    //         start: 1038,
    //         end: 1054
    //     },{
    //         title: '',
    //         number: 100,
    //         start: 1019,
    //         end: 1037
    //     },{
    //         title: '',
    //         number: 99,
    //         start: 1001,
    //         end: 1018
    //     },{
    //         title: '',
    //         number: 98,
    //         start: 976,
    //         end: 1000
    //     },{
    //         title: '',
    //         number: 97,
    //         start: 956,
    //         end: 975
    //     },{
    //         title: '',
    //         number: 96,
    //         start: 938,
    //         end: 955
    //     },{
    //         title: '',
    //         number: 95,
    //         start: 918,
    //         end: 937
    //     },{
    //         title: '',
    //         number: 94,
    //         start: 890,
    //         end: 917
    //     },{
    //         title: '',
    //         number: 93,
    //         start: 873,
    //         end: 889
    //     },{
    //         title: '',
    //         number: 92,
    //         start: 856,
    //         end: 872
    //     },{
    //         title: '',
    //         number: 91,
    //         start: 840,
    //         end: 855
    //     },{
    //         title: '',
    //         number: 90,
    //         start: 824,
    //         end: 839
    //     },{
    //         title: '',
    //         number: 89,
    //         start: 807,
    //         end: 823
    //     },{
    //         title: '',
    //         number: 87,
    //         start: 788,
    //         end:806
    //     },{
    //         title: '',
    //         number: 86,
    //         start: 772,
    //         end:787
    //     },{
    //         title: '',
    //         number: 85,
    //         start: 756,
    //         end:771
    //     },{
    //         title: '',
    //         number: 84,
    //         start: 744,
    //         end:755
    //     },{
    //         title: '',
    //         number: 83,
    //         start: 735,
    //         end:743
    //     },{
    //         title: '',
    //         number: 82,
    //         start: 725,
    //         end:734
    //     },{
    //         title: '',
    //         number: 81,
    //         start: 715,
    //         end:724
    //     },{
    //         title: '',
    //         number: 80,
    //         start: 695,
    //         end:714
    //     },{
    //         title: '',
    //         number: 79,
    //         start: 681,
    //         end:694
    //     },{
    //         title: '',
    //         number: 78,
    //         start: 663,
    //         end:680
    //     },{
    //         title: '',
    //         number: 77,
    //         start: 653,
    //         end:662
    //     },{
    //         title: '',
    //         number: 76,
    //         start: 643,
    //         end:652
    //     },{
    //         title: '',
    //         number: 75,
    //         start: 631,
    //         end:642
    //     },{
    //         title: '',
    //         number: 74,
    //         start: 618,
    //         end:630
    //     },{
    //         title: '',
    //         number: 73,
    //         start: 609,
    //         end:617
    //     },{
    //         title: '',
    //         number: 72,
    //         start: 596,
    //         end:608
    //     },{
    //         title: '',
    //         number: 71,
    //         start: 586,
    //         end:595
    //     },{
    //         title: '',
    //         number: 70,
    //         start: 575,
    //         end:585
    //     },{
    //         title: '',
    //         number: 69,
    //         start: 564,
    //         end:574
    //     },{
    //         title: '',
    //         number: 68,
    //         start: 554,
    //         end:563
    //     },{
    //         title: '',
    //         number: 67,
    //         start: 528,
    //         end:553
    //     },{
    //         title: '',
    //         number: 66,
    //         start: 519,
    //         end:527
    //     },{
    //         title: '',
    //         number: 65,
    //         start: 511,
    //         end:518
    //     },{
    //         title: '',
    //         number: 64,
    //         start: 503,
    //         end:510
    //     },{
    //         title: '',
    //         number: 63,
    //         start: 495,
    //         end:502
    //     },{
    //         title: '',
    //         number: 62,
    //         start: 487,
    //         end:494
    //     },{
    //         title: '',
    //         number: 61,
    //         start: 479,
    //         end:486
    //     },{
    //         title: '',
    //         number: 60,
    //         start: 471,
    //         end:478
    //     },{
    //         title: '',
    //         number: '59-1',
    //         start: 1,
    //         end:470
    //     }
    // ]
    const isMostRecent = event.type === 'most-recent'
    let categoryList = [
        {
            title:'',
            key: 131,
            start: 1465,
            end: 1475
        },
        {
            title:'',
            key: 130,
            start: 1448,
            end: 1464
        },
        {
            title:'',
            key: 129,
            start: 1434,
            end: 1447
        },
        {
            title:'',
            key: 128,
            start: 1415,
            end: 1433
        },
        {
            title:'认罪认罚专题',
            key: 127,
            start: 1403,
            end: 1414
        },{
            title: '',
            key: 125,
            start: 1387,
            end: 1402
        },{
            title: '',
            key: 124,
            start: 1364,
            end: 1386
        },{
            title: '办理扫黑除恶刑事案件专辑',
            key: 123,
            start: 1354,
            end: 1363
        },{
            title: '',
            key: 122,
            start: 1334,
            end: 1353
        },{
            title: '依法惩处妨害疫情防控犯罪专辑',
            key: 121,
            start: 1314,
            end: 1333
        },{
            key: 120,
            start: 1297,
            end: 1313
        },{
            key: 117,
            start: 1283,
            end: 1296
        },{
            title:'组织、强迫、引诱、容留、介绍卖淫专栏',
            key: 115,
            start: 1267,
            end: 1282
        },{
            title:'',
            key: 114,
            start: 1251,
            end: 1266
        },{
            title:'',
            key: 113,
            start: 1238,
            end: 1250
        },{
            title:'',
            key: 112,
            start: 1220,
            end: 1235
        },{
            title:'',
            key: 111,
            start: 1205,
            end: 1219
        },{
            title:'毒品案犯罪案件专题',
            key: 110,
            start: 1193,
            end: 1204
        },{
            title:'抢劫犯罪案件专题',
            key: 109,
            start: 1180,
            end: 1192
        },{
            title:'非法证据排除专题',
            key: 108,
            start: 1164,
            end: 1179
        },{
            title: '办理黑社会性质组织犯罪案件专辑',
            key: 107,
            start: 1152,
            end: 1163
        },{
            title: '办理贪污贿赂刑事案件专刊',
            key: 106,
            start: 1136,
            end: 1151
        },{
            title: '',
            key: '105-60',
            start: 471,
            end: 1135
        },{
            title: '',
            key: '59-1',
            start: 1,
            end:470
        }
    ]

    if (isMostRecent) {
        categoryList = categoryList.slice(0, categoryList.length - 2)
    }
    console.log(event)
    const wxContext = cloud.getWXContext();
    const db = cloud.database()
    const _ = db.command

    // less than 1000
    const result1 = await db.collection('consult').limit(1000).where({
        number: _.and(_.gte(0),_.lte(1000))
    }).orderBy('number', 'desc').get();

    const data1 = result1.data.map(d => {
        const {_id, name, number} = d
        return {
            _id,
            name: `[${number}]${name}`,
            number
        }
    })

    const result2 = await db.collection('consult').limit(1000).where({
        number: _.gte(1001)
    }).orderBy('number', 'desc').get();
    const data2 = result2.data.map(d => {
        const {_id, name,number} = d
        return {
            _id,
            name: `[${number}]${name}`,
            number
        }
    })
    const allList = [...data2, ...data1];
    categoryList.forEach(category => {
        category.items = allList.filter(e => e.number >= category.start && e.number <= category.end)
    })
    return {
        categoryList
    }
}
