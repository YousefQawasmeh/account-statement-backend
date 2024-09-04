import 'dotenv/config'
import express from 'express';
import db from './db';
import "reflect-metadata"
import userRouter from './routers/user.router.js';
import recordRouter from './routers/record.router.js';
import userTypeRouter from './routers/userType.router.js';
import recordTypeRouter from './routers/recordType.router.js';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import whatsappClient from './services/sendWhatsAppMsg.js';
 
// whatsappClient.initialize();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// app.use(express.static(path.join(__dirname, '../dist copy')));


// app.post('/', async function (req, res) {
//   try{

//     const user = await whatsappClient.getNumberId(req.body.phone)
//     const chatId = user._serialized;
//     whatsappClient.sendMessage(chatId, req.body.message);
//     // whatsappClient.sendMessage(req.body.phone, req.body.message);
//     res.send("Message sent");
//   }catch (error) {
//     res.status(500).send("Something went wrong: " + error);
//   }
// })

// app.get('/', function (req, res) {
//   // whatsappClient.sendMessage("972566252561", "Hello World!");
//   res.sendFile(path.join(__dirname, '../dist copy', 'index.html'));
// });

// app.get('/', (req, res) => {
//   res.writeHead(200, {
//     'Content-Type': 'text/html'
// });
//   fs.readFile('./dist copy/index.html', null, function (error, data) {
//     if (error) {
//         res.writeHead(404);
//         res.write('Whoops! File not found!');
//     } else {
//         res.write(data);
//     }
//     res.end()
//   });
//     // res.send("Hello World!");
// });

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
  whatsappClient.initialize();
});