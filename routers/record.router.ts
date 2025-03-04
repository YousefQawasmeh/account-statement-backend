import express from 'express';
import { Record } from '../db/entity/Record.js';
import db from '../db/index.js';
import { User } from '../db/entity/User.js';
import { RecordType } from '../db/entity/RecordType.js';
import { Between, IsNull, Not } from 'typeorm';
import { sendWhatsAppMsg_API } from '../services/whatsapp.js';
import { Check } from '../db/entity/Check.js';
import { Bank } from '../db/entity/Bank.js';
import { Image } from '../db/entity/Image.js';
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
    if (!user.phone) sendWhatsAppMsg_API("972566252561", `لا يوجد رقم للمستخدم ${user.name} (${user.subName})`);

    if (user.type.id === 1) {
      const newTotal = user.total + amount
      const total = (newTotal >= 0 ? "عليكم: " : "لكم: ") + (newTotal >= 0 ? newTotal : newTotal * -1)
      const msgs = [
        `${displayName}تم قيد مبلغ ${amount} ${user.currency} عليكم ${notes} لحساب سوبرماركت أبو دعجان بتاريخ ${dateStr}. رصيدكم الحالي: ${total} ${user.currency}.`,
        `شكرًا لك، ${displayName} على تسديدك مبلغ ${amount * -1} ${user.currency} ${notes} لحسابكم في سوبرماركت أبو دعجان بتاريخ ${dateStr}. رصيدك الحالي: ${total} ${user.currency}.`
      ]
      user.phone && sendWhatsAppMsg_API(user.phone, amount >= 0 ? msgs[0] : msgs[1]);
      user.phone2 && sendWhatsAppMsg_API(user.phone2, amount >= 0 ? msgs[0] : msgs[1]);
    }
    else {
      // sendWhatsAppMsg_API(972566252561, `did not send whatsapp msg to ID:${user.id} Card ID: ${user.cardId} Name: ${user.name} Phone: ${user.phone} --- ${userNo}`);
    }

  } catch (error) {
    console.error(error);
    try {
      sendWhatsAppMsg_API("972566252561", ` ERROR: did not send whatsapp msg to ID:${user.id} Card ID: ${user.cardId} Name: ${user.name} (${user.subName}) Phone: ${user.phone} --- ${[user.phone, user.phone2]}`);
    }
    catch (error) {
      console.error(error);
    }
    // res.status(500).send("Something went wrong: " + error);
  }
}

router.get('/', async (req, res) => {
  const filters = await getFilters(req);
  const records = await Record.find({ where: { ...filters }, order: { date: 'ASC', createdAt: 'ASC' }, relations: ['user', 'type'] });
  res.send(records.map(({ checksFrom, checksTo, images, ...record }) => {
    return {
      ...record,
      checks: [...(checksFrom || []), ...(checksTo || [])].map((check: any) => {
        check.images = check.images.map((image: { name: string; }) => image.name);
        return check
      }),
      images: images.map(image => image.name),
    }
  }));

  //   const query = await dataSource
  //     .getRepository(Record)
  //     .createQueryBuilder("record")
  //     .leftJoinAndSelect("record.user", "user")
  //     .leftJoinAndSelect("record.type", "type")
  //     .leftJoinAndSelect("record.checks", "checks")
  //     .leftJoinAndSelect("checks.fromRecord", "fromRecord")
  //     .leftJoinAndSelect("checks.toRecord", "toRecord")
  //     .orderBy("record.date", "ASC")
  //     .addOrderBy("record.createdAt", "ASC")

  // const queryFilters: any = req.query
  // for (const key of Object.keys((queryFilters) as any)) {
  //   if (filtersKeys[key]) {
  //     if (key === 'date' && queryFilters[key]?.from && queryFilters[key]?.to) {
  //       const fromDate = new Date(new Date(queryFilters[key].from).setHours(0, 0, 0, 0));
  //       const toDate = new Date(new Date(queryFilters[key].to).setHours(23, 59, 59, 999));
  //       query.andWhere(`record.date >= :fromDate`, { fromDate });
  //       query.andWhere(`record.date <= :toDate`, { toDate });
  //     }
  //     else{
  //       query.andWhere(`${filtersKeys[key]}.${key} = :value`, { value: queryFilters[key] }); 
  //     }
  //   }

  // }
  //   const records = await query.getMany();

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
    if (!req.body.user) {
      res.status(400).send("Missing user!");
      return;
    }
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
    if (isNaN(+req.body.amount)) {
      res.status(400).send("Missing amount!");
      return;
    }
    if (!req.body.date) {
      res.status(400).send("Missing date!");
      return;
    }

    for (let i = 0; i < req.body.checks?.length; i++) {
      const check = req.body.checks[i]
      if(!!check.id) continue;
      if (!+check.amount) {
        res.status(400).send("Missing check [" + (i + 1) + "] amount!");
        return;
      }
      if (!check.currency) {
        res.status(400).send("Missing check [" + (i + 1) + "] currency!");
        return;
      }
      if (!+check.bankId) {
        res.status(400).send("Missing check [" + (i + 1) + "] bankId!");
        return;
      }
      if (!check.dueDate) {
        res.status(400).send("Missing check [" + (i + 1) + "] dueDate!");
        return;
      }
    }

    const recordImages: Image[] = [];
    const checksImages: Image[][] = [];
    Array.isArray(req.files) && req.files?.forEach((file: any) => {
      const image = new Image();
      image.name = file?.filename;
      image.path = file?.path;
      image.updatedAt = new Date();
      if (file.fieldname.startsWith('images[')) {
        recordImages.push(image);
      }
      else if (file.fieldname.startsWith('checks[')) {
        const ckeckNo = file.fieldname.match(/\[(\d+)\]/)?.[1];
        if (checksImages[+ckeckNo]?.length > 0) {
          checksImages[+ckeckNo].push(image);
        }
        else {
          checksImages[+ckeckNo] = [image];
        }
      }
    })

    const checks: Check[] = [];
    for (const checkDetails of (req.body?.checks || [])) {
      if (checkDetails.id) {
        const check = await Check.findOneBy({ id: checkDetails.id, available: true });
        if (!check) {
          return res.status(404).send("Check not found or not available!");
        }
        check.available = false;
        await check.save();
        checks.push(check);
      }
      else {
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
    }
    const record = new Record();
    record.amount = +req.body.amount;
    record.date = req.body.date;
    record.notes = req.body.notes;
    record.type = recordType;
    record.user = user;
    // record.checks = checks;

    db.dataSource.transaction(async (transactionManager) => {
      const savedRecord = await transactionManager.save(record);

      for (let index = 0; index < checks.length; index++) {
        const check = checks[index];
        if (check.available) {
          check.fromRecord = savedRecord;
        }
        else {
          check.available = false;
          check.toRecord = savedRecord;
        }
        const savedCheck = await transactionManager.save(check);

        for (const image of checksImages[index] || []) {
          image.check = savedCheck;
          await transactionManager.save(image);
        }
      }

      for (const image of recordImages) {
        image.record = savedRecord;
        await transactionManager.save(image);
      }

    }).then(async () => {
      sendWhatsAppMsg(user, record).catch(error => {
        console.error("Send whatsapp msg failed:", error);
      });
      const responseRecord = {
        ...record,
        checks: checks.map((check, index) => ({
          id: check.id,
          amount: check.amount,
          checkNumber: check.checkNumber,
          bank: check.bank,
          available: check.available,
          images: checksImages[index]?.map(image => image.name)
        }))
      };
      res.status(201).send(responseRecord);
    }).catch(error => {
      console.error("Save record transaction failed:", error);
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
    // to do: need to delete the checks from the database not here
    // record.checks.forEach(check => {
    //   if(check.available){
    //     check.deletedAt = new Date();
    //   }
    //   else{
    //     check.available = true;
    //     check.toRecord = null;
    //   }
    //   await check.save().catch(error => {
    //     console.error(error);
    //     res.status(500).send("Something went wrong, couldn't update check: " + error);
    //   })
    // });
    record.notes += ` ::: ${req.body.notes}`;

    await record.save();

    res.send('Record Deleted');

  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});


export default router;
