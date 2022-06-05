const {getLessons, addLessons} = require("./lesson.service");
const {splitting} = require("../../static/functions");
const {lessons_config} = require("../../config/config");
exports.get = async (ctx, next) => {
    await next()
    try {
        const queries = [
            'date',
            'status',
            'teacherIds',
            'studentsCount',
            'page',
            'lessonsPerPage'
        ];
        let params = {
            lessonsPerPage: lessons_config.lessonsPerPage,
            page: lessons_config.page
        }
        for (let key of queries) {
            if (ctx.request.query?.[key]) {
                let param = ctx.request.query[key]
                params[key] = ctx.request.query[key]
                switch (key) {
                    case 'date':
                        param = splitting(params[key])
                        if (!(new Date(param[0])).getTime() > 0 || param?.[1] && !(new Date(param[1])).getTime() > 0)
                            errorThrow(`${key} param error!`)
                        break;
                    case 'status':
                        if (!Number.isInteger(parseInt(param)) || param > 1)
                            errorThrow(`${key} param error!`)
                        break;
                    case 'lessonsPerPage':
                    case 'page':
                        if (!Number.isInteger(parseInt(param)))
                            errorThrow(`${key} param error!`)
                        break;
                    case 'studentsCount':
                    case 'teacherIds':
                        param = splitting(params[key])
                        for (let n of param) {
                            if (!Number.isInteger(parseInt(n)))
                                errorThrow(`${key} param error!`)
                        }
                        break;
                }
            }
        }
        let result = await getLessons(params)
        if (result.error)
            errorThrow(result.error)
        ctx.body = result;
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = {
            error: ctx.status,
            message: err.message
        };
    }
};

exports.post = async (ctx, next) => {
    await next()
    try {
        const {teacherIds,title,days,firstDate,lessonsCount,lastDate} = ctx.request.body
        if(!teacherIds || !title || !days || !firstDate){
            errorThrow(`params teacherIds, title, days, firstDate are required!`)
        }else if(!lessonsCount && !lastDate){
            errorThrow(`one of the params is expected: lessonsCount or lastDate!`)
        }
        const params = [
            'teacherIds',//: [1,2], // id учителей, ведущих занятия
            'title',//: ‘Blue Ocean’, // Тема занятия. Одинаковая на все создаваемые занятия
            'days',//: [0,1,3,6], // Дни недели, по которым нужно создать занятия, где 0 - это воскресенье
            'firstDate',//: ‘2019-09-10’, // Первая дата, от которой нужно создавать занятия
            'lessonsCount',//: 9, // Количество занятий для создания
            'lastDate',
        ];
        for (let key of params) {
            if (ctx.request.body?.[key]) {
                let param = ctx.request.body[key]
                params[key] = ctx.request.body[key]
                switch (key) {
                    case 'firstDate':
                    case 'lastDate':
                        if (!(new Date(param)).getTime() > 0)
                            errorThrow(`${key} param format error!`)
                        break;
                    case 'title':
                        param = splitting(params[key])
                        if (param?.[1])
                            errorThrow(`${key} param format error!`)
                        break;
                    case 'lessonsCount':
                        if (!Number.isInteger(parseInt(param)))
                            errorThrow(`${key} param format error!`)
                        break;
                    case 'days':
                    case 'teacherIds':
                        param = splitting(params[key])
                        if(!param.length){
                            errorThrow(`${key} param format error!`)
                        }
                        for (let n of param) {
                            if (!Number.isInteger(parseInt(n)))
                                errorThrow(`${key} param format error!`)
                        }
                        break;
                }
            }
        }
        let result = await addLessons({teacherIds,title,days,firstDate,lessonsCount,lastDate});
        if (result.error)
            errorThrow(result.error)
        ctx.body = result;
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = {
            error: ctx.status,
            message: err.message
        };
    }
};

const errorThrow = (message) => {
    throw {status: 400, message: message}
}