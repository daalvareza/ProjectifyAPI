import { Request, Response } from "express";
import Project from "../models/projectModel";

// Function for adding a new project
const addProject = async (req: Request, res: Response) => {
    // Extract necessary data from the request body
    const { name, description } = req.body;

    // Create a new project instance
    const newProject = new Project({ name, description });

    // Save the new project to the database
    await newProject.save()
        .then((project: any) => console.log(`New project created: ${project}`))
        .catch((error: any) => {
            return res.status(400).json({
                error: error
            });
        });

    // Return a JSON response indicating success
    return res.status(200).json({
        message: `New project created: ${newProject}`
    });
}

// Function for getting projects
const getProjects = async (req: Request, res: Response) => {
    // Retrieve all projects from the database
    const allProjects = await Project.find();

    // Return a JSON response with the list of projects
    return res.status(200).json({
        projects: allProjects
    });
}

export default { addProject, getProjects };