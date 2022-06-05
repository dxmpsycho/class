const knex = require("../connect");
const {splitting} = require("../../static/functions");
const {lessons_config} = require("../../config/config");
exports.getLessons = async (params) => {
    try {
        return await knex.transaction(function (trx) {
            let query = setQuery(params, knex('lessons'))
            query
                .leftJoin('lesson_teachers', 'lessons.id', 'lesson_teachers.lesson_id')
                .leftJoin('lesson_students', 'lessons.id', 'lesson_students.lesson_id')
                .select('lessons.id', 'lessons.date', 'lessons.title', 'lessons.status')

                .groupBy('lessons.id')
                .limit(params.lessonsPerPage)
                .offset(params.page > 1 ? params.lessonsPerPage * (params.page - 1) : 0)
                .transacting(trx)
                .then(async results => {
                    for (let lsn of results) {
                        let d = new Date(lsn.date)
                        lsn.date = `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`
                        lsn.visitCount = 0
                        let visitCount = 0
                        lsn.students = await knex.transaction(function (t) {
                            knex
                                .select('students.id', 'students.name', 'lesson_students.visit')
                                .from('students')
                                .leftJoin('lesson_students', 'students.id', 'lesson_students.student_id')
                                .where('lesson_students.lesson_id', lsn.id)
                                .transacting(t)
                                .then(t.commit)
                                .catch(t.rollback);
                        })
                        for (let s of lsn.students) {
                            s.visit ? visitCount++ : null
                        }
                        lsn.visitCount = visitCount
                        lsn.teachers = await knex.transaction(function (t) {
                            knex
                                .select('teachers.id', 'teachers.name')
                                .from('teachers')
                                .leftJoin('lesson_teachers', 'teachers.id', 'lesson_teachers.teacher_id')
                                .where('lesson_teachers.lesson_id', lsn.id)
                                .transacting(t)
                                .then(t.commit)
                                .catch(t.rollback);
                        })
                    }
                    return results;
                })
                .then(trx.commit)
                .catch(trx.rollback);
        })
    } catch (err) {
        return {error: err.message}
    }
}

exports.addLessons = async ({teacherIds, title, days, firstDate, lessonsCount, lastDate}) => {
    try {
        const lessonsDates = getLessonsDates({firstDate, lastDate, days, lessonsCount})

        let lessonsData = lessonsDates.map(date => {
            return {date, title, status: 0}
        })
        const addedLessons = await knex.transaction(function (t) {
            knex('lessons')
                .insert(lessonsData, ['id'])
                .transacting(t)
                .then(t.commit)
                .catch(t.rollback);
        })
        let lesson_teachers = []
        for (let lesson of addedLessons) {
            for (let teacher_id of teacherIds) {
                lesson_teachers.push({
                    lesson_id: lesson.id,
                    teacher_id
                })
            }
        }
        await knex.transaction(function (t) {
            knex('lesson_teachers')
                .insert(lesson_teachers)
                .transacting(t)
                .then(t.commit)
                .catch(t.rollback);
        })
        return addedLessons
    }catch (err) {
        return {error: err.message}
    }
}

const setQuery = (params, knex) => {
    for (let key in params) {
        let param = params[key]
        switch (key) {
            case 'date' :
                param = splitting(params[key])
                if (param?.[1])
                    knex.whereBetween('lessons.date', [param[0], param[1]])
                else
                    knex.where('lessons.date', [param[0]])
                break;
            case 'status':
                knex
                    .where('lessons.status', param)
                break;
            case 'studentsCount':
                param = splitting(params[key])
                if (param?.[1])
                    knex.havingRaw('count("lesson_students"."student_id") between ? and ?', [param[0], param[1]])
                else
                    knex.havingRaw('count("lesson_students"."student_id") = ?', param[0])
                break;
            case 'teacherIds':
                param = splitting(params[key])
                knex
                    .whereIn('lesson_teachers.teacher_id', param)
                break;
        }
    }
    return knex
}

const getLessonsDates = ({firstDate, lastDate, days, lessonsCount}) => {
    let from = new Date(firstDate) || new Date(),
        to = new Date(lastDate) || new Date(),
        dates = [];

    let plusOneYear = from;
    plusOneYear.setFullYear(plusOneYear.getFullYear() + lessons_config.year);

    if (lastDate && to > plusOneYear || !lastDate) {
        to = plusOneYear;
    }

    for (let day of days) {
        from = new Date(firstDate)
        while (from.getDay() !== day) {
            from.setDate(from.getDate() + 1);
        }
        // Get all the other days of week in the month
        while (from.getTime() <= to.getTime()) {
            dates.push(new Date(from.getTime()));
            from.setDate(from.getDate() + 7);
        }
    }
    dates.sort(function (a, b) {
        return a - b;
    })
    dates.splice(lessonsCount ? lessonsCount : lessons_config.count)
    return dates;
}