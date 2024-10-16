import dataSource from "./dataSource.js";
import { RecordType } from "./entity/RecordType.js";
import { UserType } from "./entity/UserType.js";
import cron from "node-cron";
import backup from "../services/db-backup.js";

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

    if (process.env.NODE_ENV === 'production') {
      cron.schedule('0 2 * * *', async () => {
        try {
          await backup();
          console.log('Backup done');
        } catch (err) {
          console.error('Backup failed:', err);
        }
      });
      console.log("Cron job scheduled for backup.");
    } else {
      console.log("Cron job will not run in non-production environment.");
    }
  }).catch(err => {
    console.error('Failed to connect to DB: ' + err);
  });
}

export default { initialize, dataSource };
