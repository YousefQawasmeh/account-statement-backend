import express from 'express';
import { Record } from '../db/entity/Record.js';
import db from '../db/index.js';
import { User } from '../db/entity/User.js';
import { RecordType } from '../db/entity/RecordType.js';
import { Between, IsNull, Not } from 'typeorm';
import { sendWhatsAppMsg_API } from '../services/whatsapp.js';
import { Check } from '../db/entity/Check.js';
import { Bank } from '../db/entity/Bank.js';
const router = express.Router();

const filtersKeys: { [key: string]: string | number } = {
  amount: 'amount',
  date: 'date',
  notes: 'notes',
  type: 'type',
  userId: 'user',
  cardId: 'user',
  active: 'active',
  limit: 'limit'
}

const getFilters = async (req: any) => {
  const filters: any = {};
  for (const key of Object.keys(req.query)) {
    if (filtersKeys[key]) {
      const DBKey = filtersKeys[key];
      let value: any = req.query[key];
      if (DBKey === 'user') {
        /*
        * @todo: get user by id .... there is a problem here when the key is 'userId' will not find the userId in the database in the users table then throws an error
        */
        const user = await User.findOneBy({ [key]: req.query[key] });
        value = user
      }

      if (DBKey === 'type') {
        const type = await RecordType.findOneBy({ [key]: +req.query[key] });
        value = type
      }

      if (DBKey === 'date' && req.query[key].from && req.query[key].to) {
        const fromDate = new Date(new Date(req.query[key].from).setHours(0, 0, 0, 0));
        const toDate = new Date(new Date(req.query[key].to).setHours(23, 59, 59, 999));
        value = Between(fromDate, toDate)
      }

      filters[DBKey] = value;
    }
  }
  return filters;
}


const sendWhatsAppMsg = async (user: User, { amount, notes, date }: { amount: number, notes: string, date: Date }) => {
  const userNo = user.phone?.length >= 9 && user.phone.length !== 12 ? ("972" + user.phone.slice(-9)) : user.phone

  const displayName = (amount >= 0 && user.subName) ? `عزيزي ${user.subName}، ` : "";
  notes = notes ? ` ( ${notes})` : ""
  let dateStr = new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
  // example for dateStr: 13/05/2023
  dateStr = dateStr.replace(/\b0?7\/10\b/, " _*7 اكتوبر🔻*_ ");

  try {
    if (user.type.id === 1 && userNo) {
      const newTotal = user.total + amount
      const total = (newTotal >= 0 ? "عليكم: " : "لكم: ") + (newTotal >= 0 ? newTotal : newTotal * -1)
      const msgs = [
        `${displayName}تم تسجيل شراءك${notes} بمبلغ ${amount} شيكل من سوبرماركت أبو دعجان بتاريخ ${dateStr}. رصيدكم الحالي: ${total} شيكل.`,
        `شكرًا لك، ${displayName} على تسديدك مبلغ ${amount * -1} شيكل لحسابكم في سوبرماركت أبو دعجان بتاريخ ${dateStr}. رصيدك الحالي: ${total} شيكل.`
      ]
      await sendWhatsAppMsg_API(+userNo, amount >= 0 ? msgs[0] : msgs[1]);
    }
    else {
      await sendWhatsAppMsg_API(972566252561, `did not send whatsapp msg to ID:${user.id} Card ID: ${user.cardId} Name: ${user.name} Phone: ${user.phone} --- ${userNo}`);
    }

  } catch (error) {
    console.log(error);
    try {
      await sendWhatsAppMsg_API(972566252561, ` ERROR: did not send whatsapp msg to ID:${user.id} Card ID: ${user.cardId} Name: ${user.name} Phone: ${user.phone} --- ${userNo}`);
    }
    catch (error) {
      console.log(error);
    }
    // res.status(500).send("Something went wrong: " + error);
  }
}

router.get('/', async (req, res) => {
  const filters = await getFilters(req);
  const records = await Record.find({ where: { ...filters }, order: { date: 'ASC', createdAt: 'ASC' }, relations: ['user', 'type'] });
  res.send(records);
});

router.get('/all', async (req, res) => {
  const filters = await getFilters(req);
  const records = await Record.find({ where: { ...filters, }, order: { date: 'ASC', createdAt: 'ASC' }, withDeleted: true, relations: ['user', 'type'] });
  res.send(records);
});

router.get('/deleted', async (req, res) => {
  const filters = await getFilters(req);
  const records = await Record.find({ withDeleted: true, relations: ['user', 'type'], where: { deletedAt: Not(IsNull()), ...filters } });
  res.send(records);
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const record = await Record.findOne({ where: { id }, relations: ['users', 'type'] });
    res.send(record);
  } catch (error) {
    res.status(404).send("Record not found!")
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const records = await Record.find({ where: { user: { id: userId } }, relations: ['user', 'type'] });
    res.send(records);
  } catch (error) {
    res.status(404).send("User not found!")
  }
});

router.get('/card/:cardId', async (req, res) => {
  try {
    const cardId = Number(req.params.cardId);
    // const user = await User.findOne({ where: { cardId } });
    // // const user = await User.findOne({ where: { cardId }, relations: [ 'records', 'type'] });
    // if (!user) {
    //   res.status(404).send("User not found!")
    //   return;
    // }
    // const records = await Record.find({ where: { user: {cardId: user.cardId} }, relations: ['type'] });
    const records = await Record.find({ where: { user: { cardId: cardId } }, relations: ['user', 'type'] });
    // const records = await Record.find({ where: { user: user.id }, relations: [ 'users', 'type'] });
    res.send(records);
  } catch (error) {
    res.status(404).send("User not found!")
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await User.findOneBy({ id: req.body.user });
    const recordType = await RecordType.findOneBy({ id: +req.body.type });

    if (!user) {
      res.status(404).send("User not found!")
      return;
    }
    if (!recordType) {
      res.status(404).send("RecordType not found!")
      return;
    }

    const checks: Check[] = [];
    for (const checkDetails of req.body.checks) {
      const bank = await Bank.findOneBy({ id: checkDetails.bankId });
      if (!bank) {
        return res.status(404).send("Bank not found!");
      }

      const check = new Check();
      check.amount = checkDetails.amount;
      check.checkNumber = checkDetails.checkNumber;
      check.bank = bank;
      check.available = checkDetails.available !== false;
      check.dueDate = checkDetails.dueDate;
      check.notes = checkDetails.notes;
      checks.push(check);
    }
    const record = new Record();
    record.amount = req.body.amount;
    record.date = req.body.date;
    record.notes = req.body.notes;
    record.type = recordType;
    record.user = user;
    record.checks = checks;

    db.dataSource.transaction(async (transactionManager) => {
      const savedRecord = await transactionManager.save(record);

      for (const check of checks) {
        check.record = savedRecord;
        await transactionManager.save(check);
      }

    }).then(async () => {
      await sendWhatsAppMsg(user, record);
      const responseRecord = {
        id: record.id,
        amount: record.amount,
        date: record.date,
        notes: record.notes,
        type: record.type,
        user: record.user,
        checks: checks.map(check => ({
          id: check.id,
          amount: check.amount,
          checkNumber: check.checkNumber,
          bank: check.bank,
          available: check.available
        }))
      };
      res.status(201).send(responseRecord);
    }).catch(error => {
      res.status(500).send("Something went wrong: " + error);
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong, " + error);
  }
});

// // this code will be commented out because its not good thing to update records
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const record = await Record.findOneBy({ id });
  if (record) {
    if (req.body.amount !== undefined) record.amount = req.body.amount;
    if (req.body.date !== undefined) record.date = new Date(req.body.date);
    if (req.body.notes !== undefined) record.notes = req.body.notes;
    const updatedRecord = await record.save();
    res.status(200).send({ updatedRecord });
  }
  else {
    res.status(404).send('Record not found!');
  }
});


// delete Record will not delete it from the database it will just mark it as deleted
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const record = await Record.findOneBy({ id });
    if (!record) {
      res.status(404).send('Record not found!');
      return;
    }

    if (record.deletedAt) {
      res.status(404).send('Record already deleted!');
      return;
    }

    if (!req.body.notes) {
      res.status(400).send('Missing notes!');
      return;
    }

    record.deletedAt = new Date();
    record.notes += ` ::: ${req.body.notes}`;

    await record.save();

    res.send('Record Deleted');

  } catch (error) {
    res.status(500).send('Something went wrong!');
  }
});


export default router;
