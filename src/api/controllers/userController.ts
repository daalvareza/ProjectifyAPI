import { Request, Response } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

// Function for adding a new user
const addUser = async (req: Request, res: Response) => {
    
    const { username, password } = req.body;

    // Find the user in the database based on the username
    const user = await User.findOne({ username });

    // Validates if the username is already taken
    if (user) {
        return res.status(409).json({
            error: 'Username is already taken'
        });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user instance
    const newUser = new User({
        username: username,
        password: hashedPassword
    });

    // Save the new user to the database
    await newUser.save()
        .then((user: any) => {
            return res.status(200).json({
                message: `New user created: ${JSON.stringify(user)}`
            });
        })
        .catch((error: any) => {
            return res.status(400).json({
                error: error.message
            });
        });    
}

// Function for user login
const login = async (req: Request, res: Response) => {
    // Extract username and password from the request body
    const { username, password } = req.body;

    // Find the user in the database based on the username
    const user = await User.findOne({ username });

    // Check if the user exists and the password is correct
    if (user && await bcrypt.compare(password, user.password)) {
        // Generate a JWT token for authentication
        const token = jwt.sign({ _id: user._id }, 'your-secret-key', { expiresIn: '24h' });
        // Return the token in a JSON response
        return res.status(200).json({
            token: token
        });
    } else {
        // Return an error message if the username or password is invalid
        return res.status(401).json({
            error: 'Invalid username or password'
        });
    }
}

export default {addUser, login};
