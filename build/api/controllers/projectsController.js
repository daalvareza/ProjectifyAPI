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
    // Create a new project instance
    const newProject = new projectModel_1.default({
        name: 'testProject',
        description: 'testDescription'
    });
    // Save the new project to the database
    newProject.save()
        .then((project) => console.log(project))
        .catch((error) => console.log(error));
    // Return a JSON response indicating success
    return res.status(200).json({
        message: `New project created: ${newProject}`
    });
});
// Function for getting projects
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Return a JSON response with a message indicating there are no projects currently
    return res.status(200).json({
        message: 'Right now there are no projects, but soon!'
    });
});
exports.default = { addProject, getProjects };
