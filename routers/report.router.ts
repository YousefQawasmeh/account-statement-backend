import express from 'express';
import { getUsersWithMismatchedTotal, getOverdueUsersByDays } from '../controlers/index.js'
import { authenticate, adminOnly, anyRole, editorOrAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get('/usersWithMismatchedTotal', authenticate, anyRole, async (_, res) => {
  const usersWithMismatchedTotal = await getUsersWithMismatchedTotal();
  res.send(usersWithMismatchedTotal);
});

router.get('/overdueUsers/:days', authenticate, anyRole, async (req, res) => {
    const days = parseInt(req.params.days, 10) || 35;
    const overdueUsers = await getOverdueUsersByDays(days);
    res.send(overdueUsers);
});


export default router;