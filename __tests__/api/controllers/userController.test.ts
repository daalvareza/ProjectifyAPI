import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import User from '../../../src/api/models/userModel';
import userController from '../../../src/api/controllers/userController';

describe('User Controller', () => {
    // Define the Request and Response objects to be used in the tests
    let req: Request;
    let res: Response;

    // Before each test, setup the Request and Response objects
    beforeEach(() => {    
        req = {
            body: {
                username: 'testUser',
                password: 'testPassword'
            }
        } as Request;
    
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
    });
    
    // After each test, clear all the mocks
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test suite for the addUser method
    describe('addUser', () => {      
        // Test case: New user is created when username is not taken
        it("Should create a new user when the username is not taken", async () => {
            User.findOne = jest.fn().mockResolvedValueOnce(null);
            jest.spyOn(User.prototype, 'save').mockResolvedValueOnce({ username: "testUser" });
        
            await userController.addUser(req, res);
        
            // Check the database calls and responses
            expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
            expect(User.prototype.save).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'New user created: {"username":"testUser"}',
            });
        });

        // Test case: Error returned when username is already taken
        it("Should return an error when the username is already taken", async () => {
            User.findOne = jest.fn().mockResolvedValueOnce({ username: "testUser" });
        
            await userController.addUser(req, res);
        
            // Check the database call and responses
            expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ error: "Username is already taken" });
        });

        // Test case: Error returned when there is an error saving the user
        it("Should return an error when there is an error saving the user", async () => {
            User.findOne = jest.fn().mockResolvedValueOnce(null);
            jest.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error("Save error"));
        
            await userController.addUser(req, res);
        
            // Check the database calls and responses
            expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
            expect(User.prototype.save).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Save error" });
          });
    });

    // Test suite for the login method
    describe('login', () => {
        // Test case: Token is generated when username and password are valid
        it("Should generate a token when the username and password are valid", async () => {
            User.findOne = jest.fn().mockResolvedValueOnce({
                username: "testUser",
                password: await bcrypt.hash("testPassword", 10),
                _id: "testUserId",
            });
            bcrypt.compare = jest.fn().mockResolvedValueOnce(true);
            jwt.sign = jest.fn().mockReturnValueOnce("testToken");
        
            await userController.login(req, res);
        
            // Check the database calls, method calls and responses
            expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
            expect(bcrypt.compare).toHaveBeenCalledWith("testPassword", expect.any(String));
            expect(jwt.sign).toHaveBeenCalledWith({ _id: "testUserId" }, 'your-secret-key', { expiresIn: '24h' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token: "testToken" });
        });
        
        // Test case: Error returned when the username or password is invalid
        it("should return an error when the username or password is invalid", async () => {
            User.findOne = jest.fn().mockResolvedValueOnce(null);
        
            await userController.login(req, res);
        
            // Check the database call and responses
            expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: "Invalid username or password" });
        });
    });
});