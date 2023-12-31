import { DataSource } from 'typeorm';
import { User } from './entity/User.js';
import { Record } from './entity/Record.js';
import { RecordType } from './entity/RecordType.js';
import { UserType } from './entity/userType.js';
import 'dotenv/config'


const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Record, RecordType, UserType],
    synchronize: true,
    logging: true,
    database: 'account-statement',
    migrations: ['./**/migration/*.ts'],

});

export default dataSource;