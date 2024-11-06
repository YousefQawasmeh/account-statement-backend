import express from 'express';
import { Bank } from '../db/entity/Bank.js';

const router = express.Router();

router.get('/', async (_, res) => {
  const banks = await Bank.find();
  res.send(banks);
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const bank = await Bank.findOne({ where: { id } });
    res.send(bank);
  } catch (error) {
    res.status(404).send("Bank not found!")
  }
});

router.post('/', async (req, res) => {
  try {
    const bank = new Bank();
    bank.id = req.body.id;
    bank.name = req.body.name;
    await bank.save();
    res.send(bank);
  } catch (error) {
    res.status(500).send("Something went wrong: " + error);
  }

});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const bank = await Bank.findOne({ where: { id } });
    if (bank) {
      // Object.assign(bank, req.body);
      if (req.body.name)
        bank.name = req.body.name;
      else
        res.status(400).send("Name is required!");
      await bank.save();
      res.send(bank);
    } else {
      res.status(404).send("Bank not found!")
    }
  } catch (error) {
    res.status(500).send("Something went wrong: " + error);
  }
});

// router.delete('/:id', async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     const bank = await Bank.findOne({ where: { id } });
//     if (bank) {
//       await bank.remove();
//       res.send("Bank deleted!");
//     } else {
//       res.status(404).send("Bank not found!")
//     }
//   } catch (error) {
//     res.status(500).send("Something went wrong: " + error);
//   }
// });

// router.get('/deleted', async (_, res) => {
//   const banks = await Bank.find({ withDeleted: true });
//   res.send(banks);
// });

// router.get('/all', async (_, res) => {
//   const banks = await Bank.find({ withDeleted: true });
//   res.send(banks);
// }); 

export default router