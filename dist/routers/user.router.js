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
const User_js_1 = require("../db/entity/User.js");
const index_js_1 = __importDefault(require("../db/index.js"));
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_js_1.User.find();
    res.send(users);
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield User_js_1.User.findOne({ where: { id }, relations: ['records', 'type'] });
        res.send(user);
    }
    catch (error) {
        res.status(404).send("User not found!");
    }
}));
router.get('/:cardId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardId = Number(req.params.cardId);
        const user = yield User_js_1.User.findOne({ where: { cardId }, relations: ['records', 'type'] });
        res.send(user);
    }
    catch (error) {
        res.status(404).send("User not found!");
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = new User_js_1.User();
        user.name = req.body.name;
        user.phone = req.body.phone;
        user.notes = req.body.notes;
        user.cardId = req.body.cardId;
        user.active = !!req.body.active;
        user.limit = req.body.limit;
        user.type = req.body.type;
        index_js_1.default.dataSource.transaction((transactionManager) => __awaiter(void 0, void 0, void 0, function* () {
            yield transactionManager.save(user);
        })).then(() => {
            res.status(201).send(user);
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
    const id = req.params.id;
    const user = yield User_js_1.User.findOneBy({ id });
    if (user) {
        if (req.body.name !== undefined)
            user.name = req.body.name;
        if (req.body.phone !== undefined)
            user.phone = req.body.phone;
        if (req.body.notes !== undefined)
            user.notes = req.body.notes;
        if (req.body.active !== undefined)
            user.active = req.body.active;
        if (req.body.limit !== undefined)
            user.limit = req.body.limit;
        if (req.body.type !== undefined)
            user.type = req.body.type; //await UserType.findOneBy({ id: req.body.type });
        yield user.save();
        res.status(200).send(user);
        // Object.entries(req.body).forEach(([key, value]) => {
        //     if (key === 'id') {
        //       return;
        //     }
        //   user[key] = value;
        // })
    }
}));
router.put('/:cardId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cardId = Number(req.params.cardId);
    const user = yield User_js_1.User.findOneBy({ cardId });
    if (user) {
        if (req.body.name !== undefined)
            user.name = req.body.name;
        if (req.body.phone !== undefined)
            user.phone = req.body.phone;
        if (req.body.notes !== undefined)
            user.notes = req.body.notes;
        if (req.body.active !== undefined)
            user.active = req.body.active;
        if (req.body.limit !== undefined)
            user.limit = req.body.limit;
        if (req.body.type !== undefined)
            user.type = req.body.type;
        yield user.save();
        res.status(200).send(user);
    }
}));
// TODO: delete user will not delete it from the database it will just mark it as deleted
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield User_js_1.User.findOneBy({ id });
        if (user) {
            yield user.remove();
            res.send('User Deleted');
        }
        else {
            res.status(404).send('User not found!');
        }
    }
    catch (error) {
        res.status(500)
            .send(`Something went wrong!`);
    }
}));
// TODO: delete user will not delete it from the database it will just mark it as deleted
router.delete('/:cardId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardId = Number(req.params.cardId);
        const user = yield User_js_1.User.findOneBy({ cardId });
        if (user) {
            yield user.remove();
            res.send('User Deleted');
        }
        else {
            res.status(404).send('User not found!');
        }
    }
    catch (error) {
        res.status(500)
            .send(`Something went wrong!`);
    }
}));
exports.default = router;
