import 'dotenv/config'
import express from 'express';
import db from './db';
import "reflect-metadata"
import userRouter from './routers/user.router.js';
import recordRouter from './routers/record.router.js';
import userTypeRouter from './routers/userType.router.js';
import recordTypeRouter from './routers/recordType.router.js';
import cors from 'cors'; 
import Axios from 'axios';
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// app.use(express.static(path.join(__dirname, '../dist copy')));

app.use('/api/users', userRouter);

app.use('/api/records', recordRouter);

app.use('/api/usertypes', userTypeRouter);

app.use('/api/recordtypes', recordTypeRouter);

// app.get('*', function (req, res) {
//   res.sendFile(path.join(__dirname, '../dist copy', 'index.html'));
// });

app.listen(port, () => {
  console.log(`The app is listening on port ${port}`);
  db.initialize();
  Axios.get(`${process.env.WHATSAPP_URL}/session/start/${process.env.WHATSAPP_SESSION_ID}`).then((response) => {
    console.log(response.data);
  })
});