import express from 'express';
import { User } from '../db/entity/User.js';
import db from '../db/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const users = await User.find();
    res.send(users);
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ where: { id }, relations: [ 'records', 'type'] });
    res.send(user);
  } catch (error) {
    res.status(404).send("User not found!")
  }
});

router.get('/:cardId', async (req, res) => {
  try {
    const cardId = Number(req.params.cardId);
    const user = await User.findOne({ where: { cardId }, relations: [ 'records', 'type'] });
    res.send(user);
  } catch (error) {
    res.status(404).send("User not found!")
  }
});

router.post('/', async (req, res) => {
  try {
    const user = new User();
    user.name = req.body.name;
    user.phone = req.body.phone;
    user.notes = req.body.notes;
    user.cardId = req.body.cardId;
    user.active = !!req.body.active;
    user.limit = req.body.limit;
    user.type = req.body.type;

    db.dataSource.transaction(async (transactionManager) => {
      await transactionManager.save(user);
    }).then(() => {
        res.status(201).send(user);
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
  const user = await User.findOneBy({ id });
  if (user) {
    if(req.body.name !== undefined) user.name = req.body.name;
    if(req.body.phone !== undefined) user.phone = req.body.phone;
    if(req.body.notes !== undefined) user.notes = req.body.notes;
    if(req.body.active !== undefined) user.active = req.body.active;
    if(req.body.limit !== undefined) user.limit = req.body.limit;
    if(req.body.type !== undefined) user.type = req.body.type; //await UserType.findOneBy({ id: req.body.type });
    await user.save();
    res.status(200).send(user);
    // Object.entries(req.body).forEach(([key, value]) => {
    //     if (key === 'id') {
    //       return;
    //     }
    //   user[key] = value;
    // })
  }
});
router.put('/:cardId', async (req, res) => {
  const cardId = Number(req.params.cardId);
  const user = await User.findOneBy({ cardId });
  if (user) {
    if(req.body.name !== undefined) user.name = req.body.name;
    if(req.body.phone !== undefined) user.phone = req.body.phone;
    if(req.body.notes !== undefined) user.notes = req.body.notes;
    if(req.body.active !== undefined) user.active = req.body.active;
    if(req.body.limit !== undefined) user.limit = req.body.limit;
    if(req.body.type !== undefined) user.type = req.body.type;
    await user.save();
    res.status(200).send(user);
  }
});


// TODO: delete user will not delete it from the database it will just mark it as deleted
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOneBy({ id });
    if (user) {
      await user.remove();
      res.send('User Deleted');
    } else {
      res.status(404).send('User not found!');
    }
  } catch (error) {
    res.status(500)
      .send(`Something went wrong!`);
  }
});
// TODO: delete user will not delete it from the database it will just mark it as deleted
router.delete('/:cardId', async (req, res) => {
  try {
    const cardId = Number(req.params.cardId);
    const user = await User.findOneBy({ cardId });
    if (user) {
      await user.remove();
      res.send('User Deleted');
    } else {
      res.status(404).send('User not found!');
    }
  } catch (error) {
    res.status(500)
      .send(`Something went wrong!`);
  }
});

export default router;