"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Record_js_1 = require("../db/entity/Record.js");
const index_js_1 = __importDefault(require("../db/index.js"));
const User_js_1 = require("../db/entity/User.js");
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const records = yield Record_js_1.Record.find();
    res.send(records);
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const record = yield Record_js_1.Record.findOne({ where: { id }, relations: ['users', 'type'] });
        res.send(record);
    }
    catch (error) {
        res.status(404).send("Record not found!");
    }
}));
router.get('/user/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const records = yield Record_js_1.Record.find({ where: { user: userId }, relations: ['type'] });
        res.send(records);
    }
    catch (error) {
        res.status(404).send("User not found!");
    }
}));
router.get('/card/:cardId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardId = Number(req.params.cardId);
        const user = yield User_js_1.User.findOne({ where: { cardId } });
        // const user = await User.findOne({ where: { cardId }, relations: [ 'records', 'type'] });
        if (!user) {
            res.status(404).send("User not found!");
            return;
        }
        const records = yield Record_js_1.Record.find({ where: { user: user.id }, relations: ['type'] });
        // const records = await Record.find({ where: { user: user.id }, relations: [ 'users', 'type'] });
        res.send(records);
    }
    catch (error) {
        res.status(404).send("User not found!");
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const record = new Record_js_1.Record();
        record.amount = req.body.amount;
        record.date = req.body.date;
        record.notes = req.body.notes;
        record.type = req.body.type;
        record.user = req.body.user;
        index_js_1.default.dataSource.transaction((transactionManager) => __awaiter(void 0, void 0, void 0, function* () {
            yield transactionManager.save(record);
        })).then(() => __awaiter(void 0, void 0, void 0, function* () {
            const id = req.body.user;
            const user = yield User_js_1.User.findOneBy({ id });
            if (user) {
                user.total = user.total + req.body.amount;
                yield user.save();
            }
            res.status(201).send(record);
        })).catch(error => {
            res.status(500).send("Something went wrong: " + error);
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong, " + error);
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const record = yield Record_js_1.Record.findOneBy({ id });
    if (record) {
        if (req.body.amount !== undefined)
            record.amount = req.body.amount;
        if (req.body.date !== undefined)
            record.date = req.body.date;
        if (req.body.notes !== undefined)
            record.notes = req.body.notes;
        if (req.body.type !== undefined)
            record.type = req.body.type;
        if (req.body.user !== undefined)
            record.user = req.body.user;
        yield record.save();
        res.status(200).send(record);
    }
}));
// TODO: delete Record will not delete it from the database it will just mark it as deleted
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const record = yield Record_js_1.Record.findOneBy({ id });
        if (record) {
            yield record.remove();
            res.send('Record Deleted');
        }
        else {
            res.status(404).send('Record not found!');
        }
    }
    catch (error) {
        res.status(500)
            .send(`Something went wrong!`);
    }
}));
exports.default = router;
