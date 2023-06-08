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
const projectModel_1 = __importDefault(require("../models/projectModel"));
// Function for adding a new project
const addProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract necessary data from the request body
    const { name, description } = req.body;
    // Create a new project instance
    const newProject = new projectModel_1.default({ name, description });
    // Save the new project to the database
    yield newProject.save()
        .then((project) => {
        return res.status(200).json({
            message: `New project created: ${JSON.stringify(project)}`,
        });
    })
        .catch((error) => {
        return res.status(400).json({
            error: error.message
        });
    });
});
// Function for getting projects
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Retrieve all projects from the database
    const allProjects = yield projectModel_1.default.find();
    // Return a JSON response with the list of projects
    return res.status(200).json({
        projects: allProjects
    });
});
exports.default = { addProject, getProjects };
