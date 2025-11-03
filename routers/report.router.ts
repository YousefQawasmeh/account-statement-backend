import express from 'express';
import { getUsersWithMismatchedTotal } from '../controlers/index.js'

const router = express.Router();

router.get('/usersWithMismatchedTotal', async (_, res) => {
  const usersWithMismatchedTotal = await getUsersWithMismatchedTotal();
  res.send(usersWithMismatchedTotal);
});

export default router;