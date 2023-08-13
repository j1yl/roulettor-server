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
exports.startGameLoop = exports.addBalanceToUser = exports.removeBalanceFromUser = exports.evaluateBets = exports.getBets = exports.placeBet = exports.spinTheWheel = exports.randomRouletteNumber = exports.resetGame = exports.rouletteGameState = exports.nextGameStartTime = void 0;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../db"));
const server_1 = require("../server");
exports.rouletteGameState = {
    rouletteNumber: null,
    bets: [],
};
function resetGame() {
    console.log(`resetting game ${new Date().toLocaleTimeString()}`);
    exports.rouletteGameState = {
        rouletteNumber: null,
        bets: [],
    };
}
exports.resetGame = resetGame;
function randomRouletteNumber() {
    const hash = crypto_1.default
        .createHmac("sha256", new Date().toISOString())
        .digest("hex");
    const subHash = hash.substring(0, 8);
    return Math.abs(parseInt(subHash, 16) % 15);
}
exports.randomRouletteNumber = randomRouletteNumber;
function spinTheWheel() {
    console.log(`\nspinning the wheel ${new Date().toLocaleTimeString()}`);
    exports.rouletteGameState.rouletteNumber = randomRouletteNumber();
    server_1.io.emit("spinResult", {
        rouletteNumber: exports.rouletteGameState.rouletteNumber,
    });
    console.log(`- ${exports.rouletteGameState.rouletteNumber}`);
}
exports.spinTheWheel = spinTheWheel;
function placeBet(userId, amount, color) {
    return __awaiter(this, void 0, void 0, function* () {
        const bet = { userId, amount, color };
        exports.rouletteGameState.bets.push(bet);
        yield removeBalanceFromUser(userId, amount);
    });
}
exports.placeBet = placeBet;
function getBets() {
    return exports.rouletteGameState.bets;
}
exports.getBets = getBets;
function evaluateBets() {
    console.log(`evaluating bets ${new Date().toLocaleTimeString()}`);
    const winningNumber = exports.rouletteGameState.rouletteNumber
        ? exports.rouletteGameState.rouletteNumber
        : -1;
    let winningColor = "";
    if (winningNumber % 2 === 0) {
        winningColor = "black";
    }
    else {
        winningColor = "red";
    }
    if (winningNumber === 0) {
        winningColor = "green";
    }
    let unique = [...new Set(exports.rouletteGameState.bets)];
    unique.forEach((bet) => {
        let winnings = 0;
        if (bet.color === winningColor) {
            switch (winningColor) {
                case "red":
                    winnings = bet.amount * 2;
                    break;
                case "black":
                    winnings = bet.amount * 2;
                    break;
                case "green":
                    winnings = bet.amount * 14;
                    break;
            }
            console.log(`- ${bet.userId} won ${winnings} ${bet.color}`);
            server_1.io.emit("winningBet", { userId: bet.userId, amount: bet.amount });
            addBalanceToUser(bet.userId, winnings);
        }
        else {
            console.log(`- ${bet.userId} lost ${bet.amount} ${bet.color}`);
            server_1.io.emit("losingBet", { userId: bet.userId, amount: bet.amount });
        }
    });
}
exports.evaluateBets = evaluateBets;
function removeBalanceFromUser(userId, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.default.user.update({
            where: { id: parseInt(userId) },
            data: {
                balance: {
                    decrement: amount,
                },
            },
        });
    });
}
exports.removeBalanceFromUser = removeBalanceFromUser;
function addBalanceToUser(userId, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.default.user.update({
            where: { id: parseInt(userId) },
            data: {
                balance: {
                    increment: amount,
                },
            },
        });
    });
}
exports.addBalanceToUser = addBalanceToUser;
function startGameLoop(io) {
    const gameInterval = parseInt(process.env.GAME_INTERVAL);
    const runGame = () => __awaiter(this, void 0, void 0, function* () {
        spinTheWheel();
        evaluateBets();
        resetGame();
        exports.nextGameStartTime = Date.now() + gameInterval;
        console.log("next game at", new Date(exports.nextGameStartTime).toLocaleTimeString());
        io.emit("nextGameStart", { nextGameStartTime: exports.nextGameStartTime });
        setTimeout(runGame, gameInterval);
    });
    runGame();
}
exports.startGameLoop = startGameLoop;
