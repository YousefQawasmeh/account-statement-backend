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
const UserType_js_1 = require("../db/entity/UserType.js");
const index_js_1 = __importDefault(require("../db/index.js"));
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usersTypes = yield UserType_js_1.UserType.find();
    res.send(usersTypes);
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const userType = yield UserType_js_1.UserType.findOne({ where: { id } });
        res.send(userType);
    }
    catch (error) {
        res.status(404).send("UserType not found!");
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userType = new UserType_js_1.UserType();
        userType.title = req.body.title;
        userType.id = Number(req.body.id);
        index_js_1.default.dataSource.transaction((transactionManager) => __awaiter(void 0, void 0, void 0, function* () {
            yield transactionManager.save(userType);
        })).then(() => {
            res.status(201).send(userType);
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
    const userType = yield UserType_js_1.UserType.findOneBy({ id });
    if (userType) {
        if (req.body.id !== undefined)
            userType.id = id;
        if (req.body.title !== undefined)
            userType.title = req.body.title;
        yield userType.save();
        res.status(200).send(userType);
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const userType = yield UserType_js_1.UserType.findOneBy({ id });
        if (userType) {
            yield userType.remove();
            res.send('UserType Deleted');
        }
        else {
            res.status(404).send('UserType not found!');
        }
    }
    catch (error) {
        res.status(500)
            .send(`Something went wrong!`);
    }
}));
exports.default = router;
