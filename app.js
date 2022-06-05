const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new Router();
const {routes} = require('./app/routes')
const knex = require("./app/connect");
try {
    app.use(bodyParser());

    routes(router)

    app
        .use(router.routes())
        .use(router.allowedMethods());

    app.use(async ctx => {
        ctx.body = 'Hello World';
    });

    app.listen(3000);

    module.exports.app = app

}catch (e) {
    console.log('Error:', e)
}