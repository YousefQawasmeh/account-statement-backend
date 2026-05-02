import 'dotenv/config'
import express from 'express';
import db from './db';
import "reflect-metadata"
import userRouter from './routers/user.router.js';
import recordRouter from './routers/record.router.js';
import userTypeRouter from './routers/userType.router.js';
import recordTypeRouter from './routers/recordType.router.js';
import checkRouter from './routers/check.router.js';
import BankRouter from './routers/bank.router.js';
import imageRouter from './routers/image.router.js';
import reminderRouter from './routers/reminder.router.js';
import reportRouter from './routers/report.router.js';
import accountRouter from './routers/account.router.js';
import uploadFiles from './middleware/uploadFiles.js';
import { authenticate, writeProtect } from './middleware/auth.js';
import cors from 'cors';
import {initializeRemindersCron} from './services/remindersCron.js'

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', accountRouter);

app.use('/api/users', authenticate, writeProtect, userRouter);

app.use('/api/records', authenticate, writeProtect, uploadFiles.any(), recordRouter);

app.use('/api/usertypes', authenticate, writeProtect, userTypeRouter);

app.use('/api/recordtypes', authenticate, writeProtect, recordTypeRouter);

app.use('/api/checks', authenticate, writeProtect, checkRouter);

app.use('/api/banks', authenticate, writeProtect, BankRouter);

app.use('/api/images', authenticate, writeProtect, imageRouter);

app.use('/api/reminders', authenticate, writeProtect, reminderRouter);

app.use('/api/reports', authenticate, writeProtect, reportRouter);

app.listen(port, () => {
  console.log(`The app is listening on port ${port}`);
  db.initialize();

  initializeRemindersCron();
});
