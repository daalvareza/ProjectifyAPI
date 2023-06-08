"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const reportsController_1 = __importDefault(require("../controllers/reportsController"));
const authorization_1 = __importDefault(require("../middlewares/authorization"));
const router = express_1.default.Router();
router.post('/create', authorization_1.default, reportsController_1.default.addReport);
router.get('/', authorization_1.default, reportsController_1.default.getReports);
router.put('/update', authorization_1.default, reportsController_1.default.updateReports);
module.exports = router;
