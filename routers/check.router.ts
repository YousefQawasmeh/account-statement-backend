import express from 'express';
import { Check } from '../db/entity/Check.js';
import { IsNull, Not } from 'typeorm';

const router = express.Router();

router.get('/', async (req, res) => {
  const filters: any = {};
  if(req.query.available === 'true') {
    filters['available'] = true
  }
  const checks = await Check.find( { where: { ...filters }, relations: ['fromRecord', 'bank', 'fromRecord.user', 'toRecord', 'toRecord.user'] } );
  const responseChecks = checks.map(check => {
    return {...check, images: check.images.map(image => image.name)}
  })
  res.send(responseChecks);
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const check = await Check.findOne({ where: { id }, relations: ['fromRecord', 'bank', 'fromRecord.user', 'toRecord', 'toRecord.user'] });
    res.send(check);
  } catch (error) {
    res.status(404).send("Check not found!")
  }
});

router.post('/', async (req, res) => {
  try {
    const check = new Check();
    check.amount = req.body.amount;
    check.checkNumber = req.body.checkNumber;
    // check.record = req.body.record;
    check.bank = req.body.bank;
    check.dueDate = req.body.dueDate;
    check.available = req.body.available !== false ;
    const newCheck = await check.save();
    res.status(201).send(newCheck);
  } catch (error) {
    res.status(500).send("Something went wrong: " + error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const check = await Check.findOne({ where: { id } });
    if (check) {
        Object.assign(check, req.body);
      await check.save();
      res.send(check);
    } else {
      res.status(404).send("Check not found!")
    }
  } catch (error) {
    res.status(500).send("Something went wrong: " + error);
  }
});

router.get('/deleted', async (_, res) => {
  const checks = await Check.find({ withDeleted: true, relations: ['fromRecord', 'bank', 'fromRecord.user', 'toRecord', 'toRecord.user'], where: { deletedAt: Not(IsNull()) } });
  res.send(checks);
});

router.get('/all', async (_, res) => {
  const checks = await Check.find({ withDeleted: true, relations: ['fromRecord', 'bank', 'fromRecord.user', 'toRecord', 'toRecord.user'] });
  res.send(checks);
});

export default router