
import { execute } from "@getvim/execute";
import { uploadFile } from "./dropbox.js";
import path from 'path';
const dbUrl = new URL(process.env.DATABASE_URL || "");

const DBPASSWORD = dbUrl.password;
const DBUSERNAME = dbUrl.username;
const DBNAME = dbUrl.pathname.slice(1);
const DBHOST = dbUrl.hostname;

const backup = async () => {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const day = date.getDate();
    // const hour = date.getHours();
    // const minute = date.getMinutes();
    // const second = date.getSeconds();
    
    // const fileName = `account-statement-${year}-${month}-${day}-${hour}-${minute}-${second}.sql`;
    // const fileName = `account-statement-${year}-${month}-${day}-${date.getTime()}.sql`;
    const fileName = `account-statement-${year}-${month}-${day}.sql`;
    const filePath = path.resolve(__dirname,'DB-backups', fileName);
  
    await execute(`PGPASSWORD="${DBPASSWORD}" pg_dump -h ${DBHOST} -U ${DBUSERNAME} -d ${DBNAME} -f /app/DB-backups/${fileName}`);
    await uploadFile(`${filePath}`, `/account statement/DB-backups/${month}`);
  };




  export default backup