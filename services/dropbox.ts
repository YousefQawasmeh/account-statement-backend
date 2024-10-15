import axios from 'axios';
import fs from 'fs';
import path from 'path';
const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

const uploadFile = async(filePath: string, dropboxPath: string="")=> {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = filePath.split(path.sep).pop();

  const url = 'https://content.dropboxapi.com/2/files/upload';
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Dropbox-API-Arg': JSON.stringify({
      path: `${dropboxPath}/${fileName}`,
      mode: 'add',
      autorename: true,
      mute: false
    }),
    'Content-Type': 'application/octet-stream'
  };

  try {
    const response = await axios.post(url, fileBuffer, { headers });
    console.log(`Uploaded ${fileName} to Dropbox successfully`);
  } catch (error) {
    console.error(`Failed to upload ${fileName} to Dropbox`, error);
  }
}


export {uploadFile};

