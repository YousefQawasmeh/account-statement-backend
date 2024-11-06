import { DataSource } from 'typeorm';
import { User } from './entity/User.js';
import { Record } from './entity/Record.js';
import { RecordType } from './entity/RecordType.js';
import { UserType } from './entity/UserType.js';
import { Check } from './entity/Check.js';
import { Bank } from './entity/Bank.js';

const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Record, RecordType, UserType, Check, Bank],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: true,
    // logging: process.env.NODE_ENV === 'development',
    database: 'account-statement',
    migrations: ['./**/migration/*.ts'],

});

export default dataSource;