"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = require("express-jwt");
// Middleware function for JWT authentication
const authenticateJWT = (0, express_jwt_1.expressjwt)({ secret: 'your-secret-key', algorithms: ['HS256'] });
exports.default = authenticateJWT;
