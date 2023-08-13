"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const gameState_1 = require("./roulette/gameState");
const server = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(server);
exports.io.on("connection", (socket) => {
    socket.emit("existingBets", (0, gameState_1.getBets)());
    socket.emit("nextGameStart", { nextGameStartTime: gameState_1.nextGameStartTime });
    console.log("a player connected", socket.id);
});
server.listen(process.env.PORT || 3001, () => {
    console.log(`listening on *:${process.env.PORT || 3000}`);
    (0, gameState_1.startGameLoop)(exports.io);
});
