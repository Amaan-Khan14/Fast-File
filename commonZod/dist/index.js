"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInSchema = exports.signUpSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signUpSchema = zod_1.default.object({
    password: zod_1.default.string().min(6),
    username: zod_1.default.string().min(3),
});
exports.signInSchema = zod_1.default.object({
    username: zod_1.default.string().min(3),
    password: zod_1.default.string().min(6),
});
