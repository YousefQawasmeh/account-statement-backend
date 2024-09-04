import express from 'express';
import { Record } from '../db/entity/Record.js';
import db from '../db/index.js';
import { User } from '../db/entity/User.js';
import { RecordType } from '../db/entity/RecordType.js';
import { Between, IsNull, Not } from 'typeorm';
import whatsappClient from '../services/sendWhatsAppMsg.js';
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


const sendWhatsAppMsg = async (user: User, amount: number) => {
  try {
    // const numbers = ["972566252561", "972569252661", "972599223379", "972569758016", "970566252561", "970569252661", "970599223379", "970569758016", "972569112002", "972599252561"]
      // const userNo = numbers.find(x => x.includes(user.phone))
      const userNo = user.phone?.length >= 9 && user.phone.length !== 12 ? ("972" + user.phone.slice(-9)) : user.phone 
      // if(user.type.id === 1 && "+972566252561 +972569252661 +972599223379 +972569758016 +970566252561 +970569252661 +970599223379 +970569758016".includes(user.phone)){
      // if(user.type.id === 1 && numbers.includes(user.phone)){
      if (user.type.id === 1 && userNo) {
        const newTotal = user.total + amount
        const total = (newTotal > 0 ? "عليك: " : "لك: ") + newTotal
        const msgs = [
          `لقد قمت بعملية شراء بمبلغ ${amount} وأصبح رصيد حسابك: ${total}`,
          `شكرا لتسديدك مبلغ ${amount} لقد أصبح رصيدك ${total}`
        ]
        const whatsappUser = await whatsappClient.getNumberId(userNo)
        const chatId = whatsappUser._serialized;
        whatsappClient.sendMessage(chatId, amount > 0 ? msgs[0] : msgs[1]);
      }
      else {
        const whatsappUser = await whatsappClient.getNumberId("972566252561")
        const chatId = whatsappUser._serialized;
        whatsappClient.sendMessage(chatId, `did not send whatsapp msg to ID:${user.id} Card ID: ${user.cardId} Name: ${user.name} Phone: ${user.phone} --- ${userNo}`);

      }
    // res.send(msg);

  } catch (error) {
    console.log(error);
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
 const records = await Record.find({ where: { ...filters, }, withDeleted: true, relations: ['user', 'type'] });
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
    const records = await Record.find({ where: { user: { id: userId } }, relations: ['type'] });
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
    const records = await Record.find({ where: { user: { cardId: cardId } }, relations: ['type'] });
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
    const record = new Record();
    record.amount = req.body.amount;
    record.date = req.body.date;
    record.notes = req.body.notes;
    record.type = recordType;
    // record.type = req.body.type;
    record.user = user;

    db.dataSource.transaction(async (transactionManager) => {
      await transactionManager.save(record);
    }).then(async () => {
      await sendWhatsAppMsg(user, req.body.amount);
      res.status(201).send(record);
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