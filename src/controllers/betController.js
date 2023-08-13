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
exports.createBet = void 0;
const db_1 = __importDefault(require("../db"));
const gameState_1 = require("../roulette/gameState");
const server_1 = require("../server");
function createBet(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, amount, color } = req.body;
            if (req.headers.secret !== process.env.SECRET)
                return res.status(401).json({ error: "Unauthorized" });
            if (!userId || !amount || !color) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            if (gameState_1.rouletteGameState.bets.find((bet) => bet.userId == userId)) {
                return res.status(400).json({ error: "User already placed a bet" });
            }
            const user = yield db_1.default.user.findUnique({
                where: {
                    id: parseInt(userId),
                },
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            if (user.balance < amount) {
                return res.status(400).json({ error: "Insufficient funds" });
            }
            if (amount < 0) {
                return res.status(400).json({ error: "Invalid amount" });
            }
            if (color !== "red" && color !== "black" && color !== "green") {
                return res.status(400).json({ error: "Invalid color" });
            }
            (0, gameState_1.placeBet)(userId, amount, color);
            console.log("bet placed:", userId, amount, color);
            server_1.io.emit("newBet", {
                userId,
                amount,
                color,
            });
            res
                .status(201)
                .json({ message: `${amount} bet on ${color} placed for ${user.email}` });
        }
        catch (error) {
            console.error("Error betting:", error);
            res.status(500).json({ error: "Failed to place bet" });
        }
    });
}
exports.createBet = createBet;
