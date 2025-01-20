
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsPath = path.join(__dirname, '..', 'uploads');
const recordImagesPath = path.join(__dirname, '..', 'uploads', 'recordImages');
const checksImagesPath = path.join(__dirname, '..', 'uploads', 'checksImages');

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}
if (!fs.existsSync(recordImagesPath)) {
    fs.mkdirSync(recordImagesPath);
}
if (!fs.existsSync(checksImagesPath)) {
    fs.mkdirSync(checksImagesPath);
}

const storage = multer.diskStorage({
    destination: (_req: any, file: any, cb: any) => {
        const getPath = () => {
            if (file.fieldname.startsWith('images[')) {
                return recordImagesPath;
            } else if (file.fieldname.startsWith('checks[')) {
                return checksImagesPath;
            }
            return uploadsPath;
        }
        cb(null, getPath());
    },
    filename: (_req: any, file: any, cb: any) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});


const uploadFiles = multer({ storage });

export default uploadFiles;