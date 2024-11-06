import dataSource from "./dataSource.js";
import { RecordType } from "./entity/RecordType.js";
import { UserType } from "./entity/UserType.js";
import cron from "node-cron";
import backup from "../services/db-backup.js";
import {sendWhatsAppMsg_API} from "../services/whatsapp.js";
import { Bank } from "./entity/Bank.js";

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

  const defaultBanks = [
    { id: 73, name: "البنك الاسلامي العربي" },
    { id: 82, name: "بنك القدس" },
    { id: 49, name: "البنك العربي" },
    { id: 67, name: "البنك العقاري المصري العربي" },
    { id: 37, name: "بنك الأردن" },
    { id: 66, name: "بنك القاهرة عمان" },
    { id: 84, name: "بنك الاسكان للتجارة والتمويل" },
    { id: 71, name: "البنك التجاري الأردني" },
    { id: 43, name: "البنك الأهلي الأردني" },
    { id: 89, name: "بنك فلسطين" },
    { id: 81, name: "البنك الإسلامي الفلسطيني" },
    { id: 76, name: "بنك الاستثمار الفلسطيني" },
    { id: 27, name: "البنك الوطني" },
    { id: 10, name: "بنك اسرائيلي" }
]

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

  for (const bank of defaultBanks) {
    const existingBank = await Bank.findOneBy({ id: bank.id });
    if (!existingBank) {
      const newBank = new Bank();
      newBank.name = bank.name;
      newBank.id = Number(bank.id);
      await newBank.save();
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
          await sendWhatsAppMsg_API(972566252561, 'Backup done');
        } catch (err) {
          console.error('Backup failed:', err);
          await sendWhatsAppMsg_API(972566252561, 'Backup failed: ' + err);
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
