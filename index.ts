import express from 'express';
import db from './db';
import "reflect-metadata"

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`The app is listening on port ${port}`);
  db.initialize();
});