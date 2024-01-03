"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_js_1 = require("./entity/User.js");
const Record_js_1 = require("./entity/Record.js");
const RecordType_js_1 = require("./entity/RecordType.js");
const UserType_js_1 = require("./entity/UserType.js");
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User_js_1.User, Record_js_1.Record, RecordType_js_1.RecordType, UserType_js_1.UserType],
    synchronize: true,
    logging: true,
    database: 'account-statement',
    migrations: ['./**/migration/*.ts'],
});
exports.default = dataSource;
