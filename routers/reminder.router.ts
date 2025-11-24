import express from 'express';
import {
    getReminders,
    getReminder,
    createReminder,
    updateReminder,
    deleteReminder,
    sendRemindersToOverdueUsersByIDs,
} from '../controlers';

const router = express.Router();

router.get('/', getReminders);
router.get('/:id', getReminder);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.post('/sendRemindersToOverdueUsersByIDs', sendRemindersToOverdueUsersByIDs);

export default router;
