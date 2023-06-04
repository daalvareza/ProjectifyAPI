"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const projectsController_1 = __importDefault(require("../controllers/projectsController"));
const authorization_1 = __importDefault(require("../middlewares/authorization"));
const router = express_1.default.Router();
router.post('/create', projectsController_1.default.addProject);
router.get('/all', authorization_1.default, projectsController_1.default.getProjects);
module.exports = router;
