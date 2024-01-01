import express from 'express';
import { RecordType } from '../db/entity/RecordType.js';
import db from '../db/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const RecordsTypes = await RecordType.find();
    res.send(RecordsTypes);
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const recordType = await RecordType.findOne({ where: { id } });
    res.send(recordType);
  } catch (error) {
    res.status(404).send("RecordType not found!")
  }
});

router.post('/', async (req, res) => {
  try {
    const recordType = new RecordType();
    recordType.title = req.body.title;
    recordType.id = Number(req.body.id);

    db.dataSource.transaction(async (transactionManager) => {
      await transactionManager.save(recordType);
    }).then(() => {
        res.status(201).send(recordType);
    }).catch(error => {
      res.status(500).send("Something went wrong: " + error);
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong, " + error);
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const recordType = await RecordType.findOneBy({ id });
  if (recordType) {
    if(req.body.id !== undefined) recordType.id = id;
    if(req.body.title !== undefined) recordType.title = req.body.title;
    await recordType.save();
    res.status(200).send(recordType);
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const id = Number( req.params.id);
    const recordType = await RecordType.findOneBy({ id });
    if (recordType) {
      await recordType.remove();
      res.send('RecordType Deleted');
    } else {
      res.status(404).send('RecordType not found!');
    }
  } catch (error) {
    res.status(500)
      .send(`Something went wrong!`);
  }
});

export default router;