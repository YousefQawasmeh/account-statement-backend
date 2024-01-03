"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dataSource_js_1 = __importDefault(require("./dataSource.js"));
const initialize = () => {
    dataSource_js_1.default.initialize().then(() => {
        console.log("Connected to DB!");
    }).catch(err => {
        console.error('Failed to connect to DB: ' + err);
    });
};
exports.default = { initialize, dataSource: dataSource_js_1.default };
