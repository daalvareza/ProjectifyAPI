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
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Function for adding a new user
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a new user instance
    const newUser = new userModel_1.default({
        username: 'testUser',
        password: 'testPassword'
    });
    // Save the new user to the database
    newUser.save()
        .then((user) => console.log(user))
        .catch((error) => console.log(error));
    // Return a JSON response indicating success
    return res.status(200).json({
        message: `New user created: ${newUser}`
    });
});
// Function for user login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract username and password from the request body
    const { username, password } = req.body;
    // Find the user in the database based on the username
    const user = yield userModel_1.default.findOne({ username });
    // Check if the user exists and the password is correct
    if (user && user.password === password) {
        // Generate a JWT token for authentication
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, 'your-secret-key', { expiresIn: '24h' });
        // Return the token in a JSON response
        return res.status(200).json({
            token: token
        });
    }
    else {
        // Return an error message if the username or password is invalid
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }
});
exports.default = { addUser, login };
