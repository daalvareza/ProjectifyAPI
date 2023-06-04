import { Request, Response } from "express";
import projectModel from "../models/projectModel";

// Function for adding a new project
const addProject = async (req: Request, res: Response) => {
    // Create a new project instance
    const newProject = new projectModel({
        name: 'testProject',
        description: 'testDescription'
    });

    // Save the new project to the database
    newProject.save()
        .then((project: any) => console.log(project))
        .catch((error: any) => console.log(error));

    // Return a JSON response indicating success
    return res.status(200).json({
        message: `New project created: ${newProject}`
    });
}

// Function for getting projects
const getProjects = async (req: Request, res: Response) => {
    // Return a JSON response with a message indicating there are no projects currently
    return res.status(200).json({
        message: 'Right now there are no projects, but soon!'
    });
}

export default { addProject, getProjects };
