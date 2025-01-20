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
import uploadFiles from './middleware/uploadFiles.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// app.use(express.static(path.join(__dirname, '../dist copy')));

app.use('/api/users', userRouter);

app.use('/api/records', uploadFiles.any(), recordRouter);

app.use('/api/usertypes', userTypeRouter);

app.use('/api/recordtypes', recordTypeRouter);

app.use('/api/checks', checkRouter);

app.use('/api/banks', BankRouter);

app.use('/api/images', imageRouter);

// app.get('*', function (req, res) {
//   res.sendFile(path.join(__dirname, '../dist copy', 'index.html'));
// });
// const whatsappInit = () => {
//   Axios.get(`${process.env.WHATSAPP_URL}/session/status/${process.env.WHATSAPP_SESSION_ID}`)
//   .then((res)=>{
//     if(res.data.state !== "CONNECTED"){
//       Axios.get(`${process.env.WHATSAPP_URL}/session/start/${process.env.WHATSAPP_SESSION_ID}`)
//       .then((response) => {
//           console.log(response.data);
//         })
//       }
//   })
//   .catch((error) => {
//     console.error("whatsapp init error", error.response?.data);
//   })
// }

app.listen(port, () => {
  console.log(`The app is listening on port ${port}`);
  db.initialize();
  
  // whatsappInit();
});