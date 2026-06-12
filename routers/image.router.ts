import express from 'express';
import { Image } from '../db/entity/Image.js';
import path from 'path';
// import { In } from 'typeorm';
import { authenticate, anyRole, editorOrAdmin } from "../middleware/auth.js";

const imageRouter = express.Router();

// imageRouter.get('/', async (req, res) => {
//     const names: string[] = req.query.names as string[];
//     const images = await Image.find({ where: { name:  In(names) } });
//     res.send(images);
// })

imageRouter.get('/', authenticate, anyRole, async (req, res) => {
    const name = req.query.name as string;
    try {
        const image = await Image.findOne({ where: { name } });
        if (image) {
            res.sendFile(path.resolve(image.path));
        }
        else {
            res.status(404).send("Image not found!")
        }
    }
    catch (error) {
        res.status(500).send("Something went wrong: " + error);
    }
})

imageRouter.delete('/:name', authenticate, editorOrAdmin, async (req, res) => {
    const name = req.params.name;
    const image = await Image.findOne({ where: { name } });
    if (image) {
        await image.remove();
        res.send("Image deleted!");
    }
    else {
        res.status(404).send("Image not found!")
    }
})

export default imageRouter