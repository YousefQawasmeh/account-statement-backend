import dataSource from "./dataSource.js";
import { RecordType } from "./entity/RecordType.js";
import { UserType } from "./entity/UserType.js";
import { execute } from "@getvim/execute";
import cron from "node-cron";

const dbUrl = new URL(process.env.DATABASE_URL || "");

const DBPASSWORD = dbUrl.password;
const DBUSERNAME = dbUrl.username;
const DBNAME = dbUrl.pathname.slice(1);
const DBHOST = dbUrl.hostname;

const backup = async () => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const day = date.getDate();
  // const hour = date.getHours();
  // const minute = date.getMinutes();
  // const second = date.getSeconds();

  // const fileName = `account-statement-${year}-${month}-${day}-${hour}-${minute}-${second}.sql`;
  const fileName = `account-statement-${year}-${month}-${day}-${date.getTime()}.sql`;

  await execute(`PGPASSWORD="${DBPASSWORD}" pg_dump -h ${DBHOST} -U ${DBUSERNAME} -d ${DBNAME} -f /app/DB-backups/${fileName}`);
};


async function insertDefaultData() {
  const defaultRecordTypes = [
    { id: 1, title: 'نقدي' },
    { id: 2, title: 'دين' },
    { id: 3, title: 'دفعة' },
    { id: 4, title: 'نقدي' },
    { id: 5, title: 'مشتريات' },
    { id: 6, title: 'دفعة له' }
  ];

  const defaultUserTypes = [
    { id: 1, title: 'زبون' },
    { id: 2, title: 'تاجر' }
  ];

  for (const type of defaultUserTypes) {
    const existingType = await UserType.findOneBy({ id: type.id });
    if (!existingType) {
      const newUserType = new UserType();
      newUserType.title = type.title;
      newUserType.id = Number(type.id);
      await newUserType.save();
    }
  }

  for (const type of defaultRecordTypes) {
    const existingType = await RecordType.findOneBy({ id: type.id });
    if (!existingType) {
      const newRecordType = new RecordType();
      newRecordType.title = type.title;
      newRecordType.id = Number(type.id);
      await newRecordType.save();
    }
  }
}
const initialize = () => {
  dataSource.initialize().then(() => {
    insertDefaultData();
    console.log("Connected to DB!");

    cron.schedule('0 2 * * *', async () => {
      try {
        await backup();
        console.log('Backup done');
      } catch (err) {
        console.error('Backup failed:', err);
      }
    });
  }).catch(err => {
    console.error('Failed to connect to DB: ' + err);
  })
}

export default { initialize, dataSource };