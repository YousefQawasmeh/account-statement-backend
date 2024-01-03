"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
require("reflect-metadata");
const user_router_js_1 = __importDefault(require("./routers/user.router.js"));
const record_router_js_1 = __importDefault(require("./routers/record.router.js"));
const userType_router_js_1 = __importDefault(require("./routers/userType.router.js"));
const recordType_router_js_1 = __importDefault(require("./routers/recordType.router.js"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../dist copy')));
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../dist copy', 'index.html'));
});
// app.get('/', (req, res) => {
//   res.writeHead(200, {
//     'Content-Type': 'text/html'
// });
//   fs.readFile('./dist copy/index.html', null, function (error, data) {
//     if (error) {
//         res.writeHead(404);
//         res.write('Whoops! File not found!');
//     } else {
//         res.write(data);
//     }
//     res.end()
//   });
//     // res.send("Hello World!");
// });
app.use('/api/users', user_router_js_1.default);
app.use('/api/records', record_router_js_1.default);
app.use('/api/usertypes', userType_router_js_1.default);
app.use('/api/recordtypes', recordType_router_js_1.default);
app.get('*', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../dist copy', 'index.html'));
});
app.listen(port, () => {
    console.log(`The app is listening on port ${port}`);
    db_1.default.initialize();
});
