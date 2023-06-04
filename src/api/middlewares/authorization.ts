import { expressjwt } from "express-jwt";

// Middleware function for JWT authentication
const authenticateJWT = expressjwt({ secret: 'your-secret-key', algorithms: ['HS256'] });

export default authenticateJWT;