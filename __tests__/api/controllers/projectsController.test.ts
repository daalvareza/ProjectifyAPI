import { Request, Response } from "express";
import Project from "../../../src/api/models/projectModel";
import projectsController from "../../../src/api/controllers/projectsController";

describe('Project Controller', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {
      body: {
        name: "Test Project",
        description: "Test Description",
      },
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  afterEach(() => jest.clearAllMocks());

  describe("addProject", () => {  
    it("Should create a new project and return a success message", async () => {
      Project.prototype.save = jest.fn().mockResolvedValueOnce(req.body);
  
      await projectsController.addProject(req, res);
  
      expect(Project.prototype.save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'New project created: {"name":"Test Project","description":"Test Description"}',
      });
    });

    it("Should return an error when there is an error saving the project", async () => {
      const errorMessage = "Save error";
      Project.prototype.save = jest.fn().mockRejectedValueOnce(new Error(errorMessage));
  
      await projectsController.addProject(req, res);
  
      expect(Project.prototype.save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getProjects', () => {
    it("Should retrieve all projects from the database and return a JSON response", async () => {
      const mockProjects = [
        { name: "Project 1", description: "Description 1" },
        { name: "Project 2", description: "Description 2" },
      ];
      Project.find = jest.fn().mockResolvedValueOnce(mockProjects);
  
      await projectsController.getProjects(req, res);
  
      expect(Project.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ projects: mockProjects });
    });
  });
});