import dataSource from "./dataSource.js";
import { RecordType } from "./entity/RecordType.js";
import { UserType } from "./entity/UserType.js";

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
  }).catch(err => {
    console.error('Failed to connect to DB: ' + err);
  })
}

export default { initialize, dataSource };