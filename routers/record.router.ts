import express from 'express';
import { Record } from '../db/entity/Record.js';
import db from '../db/index.js';
import { User } from '../db/entity/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const records = await Record.find();
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
    const records = await Record.find({ where: { user: userId }, relations: ['type'] });
    res.send(records);
  } catch (error) {
    res.status(404).send("User not found!")
  }
});

router.get('/card/:cardId', async (req, res) => {
  try {
    const cardId = Number(req.params.cardId);
    const user = await User.findOne({ where: { cardId } });
    // const user = await User.findOne({ where: { cardId }, relations: [ 'records', 'type'] });
    if (!user) {
      res.status(404).send("User not found!")
      return;
    }
    const records = await Record.find({ where: { user: user.id }, relations: ['type'] });
    // const records = await Record.find({ where: { user: user.id }, relations: [ 'users', 'type'] });
    res.send(records);
  } catch (error) {
    res.status(404).send("User not found!")
  }
});

router.post('/', async (req, res) => {
  try {
    const record = new Record();
    record.amount = req.body.amount;
    record.date = req.body.date;
    record.notes = req.body.notes;
    record.type = req.body.type;
    record.user = req.body.user;

    db.dataSource.transaction(async (transactionManager) => {
      await transactionManager.save(record);
    }).then(async () => {
      const id = req.body.user;
      const user = await User.findOneBy({ id });
      if (user) {
        user.total = user.total + req.body.amount;
        await user.save();
      }
      res.status(201).send(record);
    }).catch(error => {
      res.status(500).send("Something went wrong: " + error);
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong, " + error);
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const record = await Record.findOneBy({ id });
  if (record) {
    if (req.body.amount !== undefined) record.amount = req.body.amount;
    if (req.body.date !== undefined) record.date = req.body.date;
    if (req.body.notes !== undefined) record.notes = req.body.notes;
    if (req.body.type !== undefined) record.type = req.body.type;
    if (req.body.user !== undefined) record.user = req.body.user;
    await record.save();
    res.status(200).send(record);
  }
});


// TODO: delete Record will not delete it from the database it will just mark it as deleted
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const record = await Record.findOneBy({ id });
    if (record) {
      await record.remove();
      res.send('Record Deleted');
    } else {
      res.status(404).send('Record not found!');
    }
  } catch (error) {
    res.status(500)
      .send(`Something went wrong!`);
  }
});


export default router;