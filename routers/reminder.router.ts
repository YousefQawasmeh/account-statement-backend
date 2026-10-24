import express from 'express';
import {
    getReminders,
    getReminder,
    createReminder,
    updateReminder,
    deleteReminder,
    sendRemindersToOverdueUsersByIds,
} from '../controlers';
import { authenticate, adminOnly, anyRole, editorOrAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get('/', authenticate, anyRole, getReminders);
router.get('/:id', authenticate, anyRole, getReminder);
router.post('/', authenticate, editorOrAdmin, createReminder);
router.put('/:id', authenticate, editorOrAdmin, updateReminder);
router.delete('/:id', authenticate, adminOnly, deleteReminder);
router.post('/sendRemindersToOverdueUsersByIds', authenticate, editorOrAdmin, sendRemindersToOverdueUsersByIds);

export default router;
