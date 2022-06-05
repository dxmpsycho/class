const {get, post} = require("./lesson/lesson.controller");
exports.routes = (router) => {
    router.get('/', get)
    router.post('/lessons', post)
}