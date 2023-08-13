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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = void 0;
const db_1 = __importDefault(require("../db"));
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = parseInt(req.params.id);
            const user = yield db_1.default.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to retrieve user" });
        }
    });
}
exports.getUser = getUser;
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.headers.secret !== process.env.SECRET)
                return res.status(401).json({ error: "Unauthorized" });
            const { id, name, email } = req.body;
            let user = yield db_1.default.user.findUnique({ where: { email } });
            if (!user) {
                user = yield db_1.default.user.create({
                    data: {
                        id: parseInt(id),
                        name,
                        email,
                        balance: 100,
                    },
                });
            }
            res.status(201).json(user);
        }
        catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ error: "Failed to create user" });
        }
    });
}
exports.createUser = createUser;
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.headers.secret !== process.env.SECRET)
                return res.status(401).json({ error: "Unauthorized" });
            const userId = parseInt(req.params.id);
            const { balance } = req.body;
            if (!balance || typeof balance !== "number") {
                return res.status(400).json({ error: "Invalid balance" });
            }
            const user = yield db_1.default.user.update({
                where: { id: userId },
                data: {
                    balance: balance,
                },
            });
            res.json(user);
        }
        catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ error: "Failed to update user" });
        }
    });
}
exports.updateUser = updateUser;
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.headers.secret !== process.env.SECRET)
            return res.status(401).json({ error: "Unauthorized" });
        try {
            const userId = parseInt(req.params.id);
            yield db_1.default.user.delete({ where: { id: userId } });
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ error: "Failed to delete user" });
        }
    });
}
exports.deleteUser = deleteUser;
