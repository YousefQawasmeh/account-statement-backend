import express from 'express';
import { Record } from '../db/entity/Record.js';
import db from '../db/index.js';
import { User } from '../db/entity/User.js';
import { RecordType } from '../db/entity/RecordType.js';
import { IsNull, Not } from 'typeorm';

const router = express.Router();

router.get('/', async (req, res) => {
  const records = await Record.find( { relations: ['user', 'type'] } );
  res.send(records);
});

router.get('/all', async (req, res) => {
  const records = await Record.find({withDeleted: true, relations: ['user', 'type'] } );
  res.send(records);
});

router.get('/deleted', async (req, res) => {
  const records = await Record.find({withDeleted: true, relations: ['user', 'type'], where: {deletedAt: Not(IsNull())}});
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
    const records = await Record.find({ where: { user: {id: userId} }, relations: ['type'] });
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
    const records = await Record.find({ where: { user: {cardId: cardId} }, relations: ['type'] });
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
    if(!recordType) {
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
    res.status(200).send({updatedRecord});
  }
  else{
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