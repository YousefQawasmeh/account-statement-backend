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
const RecordType_js_1 = require("../db/entity/RecordType.js");
const index_js_1 = __importDefault(require("../db/index.js"));
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const RecordsTypes = yield RecordType_js_1.RecordType.find();
    res.send(RecordsTypes);
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const recordType = yield RecordType_js_1.RecordType.findOne({ where: { id } });
        res.send(recordType);
    }
    catch (error) {
        res.status(404).send("RecordType not found!");
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recordType = new RecordType_js_1.RecordType();
        recordType.title = req.body.title;
        recordType.id = Number(req.body.id);
        index_js_1.default.dataSource.transaction((transactionManager) => __awaiter(void 0, void 0, void 0, function* () {
            yield transactionManager.save(recordType);
        })).then(() => {
            res.status(201).send(recordType);
        }).catch(error => {
            res.status(500).send("Something went wrong: " + error);
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong, " + error);
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const recordType = yield RecordType_js_1.RecordType.findOneBy({ id });
    if (recordType) {
        if (req.body.id !== undefined)
            recordType.id = id;
        if (req.body.title !== undefined)
            recordType.title = req.body.title;
        yield recordType.save();
        res.status(200).send(recordType);
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const recordType = yield RecordType_js_1.RecordType.findOneBy({ id });
        if (recordType) {
            yield recordType.remove();
            res.send('RecordType Deleted');
        }
        else {
            res.status(404).send('RecordType not found!');
        }
    }
    catch (error) {
        res.status(500)
            .send(`Something went wrong!`);
    }
}));
exports.default = router;
