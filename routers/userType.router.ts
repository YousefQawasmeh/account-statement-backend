import express from 'express';
import { UserType } from '../db/entity/UserType.js';
import db from '../db/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const usersTypes = await UserType.find();
    res.send(usersTypes);
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userType = await UserType.findOne({ where: { id }});
    res.send(userType);
  } catch (error) {
    res.status(404).send("UserType not found!")
  }
});

router.post('/', async (req, res) => {
  try {
    const userType = new UserType();
    userType.title = req.body.title;
    userType.id = Number(req.body.id);

    db.dataSource.transaction(async (transactionManager) => {
      await transactionManager.save(userType);
    }).then(() => {
        res.status(201).send(userType);
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
  const userType = await UserType.findOneBy({ id });
  if (userType) {
    if(req.body.id !== undefined) userType.id = id;
    if(req.body.title !== undefined) userType.title = req.body.title;
    await userType.save();
    res.status(200).send(userType);
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const id = Number( req.params.id);
    const userType = await UserType.findOneBy({ id });
    if (userType) {
      await userType.remove();
      res.send('UserType Deleted');
    } else {
      res.status(404).send('UserType not found!');
    }
  } catch (error) {
    res.status(500)
      .send(`Something went wrong!`);
  }
});

export default router;