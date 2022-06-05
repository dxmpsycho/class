const {config} = require("../config/config.db");

const knex = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: config,
    asyncStackTraces: true
});
module.exports = knex;