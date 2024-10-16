import axios from 'axios';
import fs from 'fs';
import path from 'path';
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
const clientId = process.env.DROPBOX_CLIENT_ID;
const clientSecret = process.env.DROPBOX_CLIENT_SECRET;

const refreshAccessToken = async () => {
  try {
    const response = await axios.post('https://api.dropboxapi.com/oauth2/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      },
    });
    
    const newAccessToken = response.data.access_token;
    console.log('New Access Token:', newAccessToken);
    
    process.env.DROPBOX_ACCESS_TOKEN = newAccessToken;
    return newAccessToken;
  } catch (error) {
    console.error('Failed to refresh access token', error);
    throw error;
  }
};

const uploadFile = async(filePath: string, dropboxPath: string = "") => {
    let token = process.env.DROPBOX_ACCESS_TOKEN || "";
  
    try {
      await uploadFileWithToken(filePath, dropboxPath, token);
    } catch (error: any) {
      if (error.response && error.response.data.error_summary.includes('expired_access_token')) {
        console.log('Access token expired, refreshing token...');
        
        token = await refreshAccessToken() || "";
        
        await uploadFileWithToken(filePath, dropboxPath, token);
      } else {
        throw error;
      }
    }
  };
  
  const uploadFileWithToken = async (filePath: string, dropboxPath: string, token: string) => {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = filePath.split(path.sep).pop();
    
    const url = 'https://content.dropboxapi.com/2/files/upload';
    const headers = {
      Authorization: `Bearer ${token}`,
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
      throw error;
    }
  };
  


export {uploadFile};

