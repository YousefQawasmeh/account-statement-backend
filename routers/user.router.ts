import express from 'express';
import { User } from '../db/entity/User.js';
import { createUser, getNewCardId, getAllUsers, getUser, updateUser, getUsersWithMismatchedTotal } from '../controlers/index.js'
const router = express.Router();

router.get('/', async (req, res) => {
  const users = await getAllUsers();
  res.send(users);
});

router.get('/newCardId/:cardType', async (req, res) => {
  try {
    const newCardId = await getNewCardId(+req.params.cardType);
    res.send({ cardId: newCardId });
  }
  catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong, " + error);
  }
});

router.get('/usersWithMismatchedTotal', async (_, res) => {
  const usersWithMismatchedTotal = await getUsersWithMismatchedTotal();
  res.send(usersWithMismatchedTotal);
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await getUser({ id });
    res.send(user);
  } catch (error) {
    res.status(404).send("User not found!")
  }
});

router.get('/card/:cardId', async (req, res) => {
  try {
    const cardId = Number(req.params.cardId);
    const user = await getUser({ cardId });
    res.send(user);
  } catch (error) {
    res.status(404).send("User not found!")
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body.type) return res.status(400).send("Type is required");
    if (!req.body.name) return res.status(400).send("Name is required");
    if (!req.body.currency) return res.status(400).send("Currency is required");

    const newUser = await createUser(req.body);
    res.status(201).send(newUser);
  }
  catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong, " + error);
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const keysCanNotBeUpdated = ["id", "cardId", "type", "total"];
    const updatedUser = await updateUser({ id }, Object.keys(req.body)?.reduce((acc: any, key: string) => {
      if (keysCanNotBeUpdated.includes(key)) return acc
      return ({ ...acc, [key]: req.body[key] })
    }, {}));
    if (updatedUser) {
      res.status(200).send(updatedUser);
    }
    else {
      res.status(404).send("User not found!");
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong, " + error);
  }

});

router.put('/:cardId', async (req, res) => {
  const cardId = Number(req.params.cardId);
  try {
    const updatedUser = await updateUser({ cardId }, req.body);
    if (updatedUser) {
      res.status(200).send(updatedUser);
    }
    else {
      res.status(404).send("User not found!");
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong, " + error);
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