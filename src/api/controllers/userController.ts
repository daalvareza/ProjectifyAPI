import { Request, Response } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";

// Function for adding a new user
const addUser = async (req: Request, res: Response) => {
    
    const { username, password } = req.body;

    // Find the user in the database based on the username
    const user = await User.findOne({ username });

    // Create a new user instance
    const newUser = new User({
        username: username,
        password: password
    });

    // Save the new user to the database
    await newUser.save()
        .then((user: any) => console.log(`New user created: ${user}`))
        .catch((error: any) => {
            return res.status(400).json({
                error: error
            });
        });

    // Return a JSON response indicating success
    return res.status(200).json({
        message: `New user created: ${newUser}`
    });
}

// Function for user login
const login = async (req: Request, res: Response) => {
    // Extract username and password from the request body
    const { username, password } = req.body;

    // Find the user in the database based on the username
    const user = await User.findOne({ username });

    // Check if the user exists and the password is correct
    if (user && user.password === password) {
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
