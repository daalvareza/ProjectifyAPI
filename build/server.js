"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const usersRoutes_1 = __importDefault(require("./api/routes/usersRoutes"));
const projectsRoutes_1 = __importDefault(require("./api/routes/projectsRoutes"));
// Create an instance of Express
const router = (0, express_1.default)();
// Set the port number
const port = 3000;
// Connect to MongoDB
mongoose_1.default.connect('mongodb://127.0.0.1:27017/projectify');
// Get the MongoDB connection
const db = mongoose_1.default.connection;
// Event handlers for MongoDB connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to the database successfully!');
});
// Middleware for parsing JSON
router.use(express_1.default.json());
// Routes for handling user-related operations
router.use('/user', usersRoutes_1.default);
// Routes for handling project-related operations
router.use('/projects', projectsRoutes_1.default);
// Middleware for handling 404 errors
router.use((req, res) => {
    const error = new Error('Not found');
    return res.status(404).json({
        error: error.message
    });
});
// Middleware for handling authorization errors
router.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({
            error: "You need a valid token to access this route"
        });
    }
    else {
        next(err);
    }
});
// Start the server
router.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
});
