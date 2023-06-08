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
const reportModel_1 = __importDefault(require("../models/reportModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const projectModel_1 = __importDefault(require("../models/projectModel"));
const date_fns_1 = require("date-fns");
// Function for adding a new report
const addReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract necessary data from the request body
    const { userId, projectId, weekNumber, hours, year } = req.body;
    // Find the user and project based on their IDs
    const user = yield userModel_1.default.findById(userId);
    const project = yield projectModel_1.default.findById(projectId);
    // Check if the user or project is not found
    if (!user || !project) {
        return res.status(404).json({
            error: 'User or project not found'
        });
    }
    // Check if a report for the same week and project already exists
    const existingReport = yield reportModel_1.default.findOne({ user: userId, project: projectId, weekNumber, year });
    if (existingReport) {
        return res.status(409).json({
            error: 'Report for this week and project already exists'
        });
    }
    // Retrieve all reports for the given user and week
    const weekReportHours = yield reportModel_1.default.find({ user: userId, weekNumber, year });
    // Calculate the total hours for the week
    const totalHours = weekReportHours.reduce((sum, entry) => sum + entry.hours.valueOf(), 0);
    // Check if the total hours exceed the limit of 45
    if (totalHours + hours > 45) {
        return res.status(400).json({
            error: 'Total hours for this week exceed the limit of 45'
        });
    }
    // Create a new report instance
    const newReport = new reportModel_1.default({ user: userId, project: projectId, weekNumber, hours, year });
    // Update user and project associations
    user.reports.push(newReport._id);
    project.reports.push(newReport._id);
    if (!user.projects.includes(projectId)) {
        user.projects.push(project._id);
    }
    if (!project.users.includes(userId)) {
        project.users.push(user._id);
    }
    yield user.save();
    yield project.save();
    // Save the new report to the database
    yield newReport.save()
        .then((report) => {
        return res.status(200).json({
            message: `New report created: ${JSON.stringify(report)}`
        });
    })
        .catch((error) => {
        return res.status(400).json({
            error: error
        });
    });
});
// Function for getting reports for a user
const getReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the user ID from the query parameters
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'UserId is required' });
    }
    try {
        // Find the user and populate the associated reports
        const user = yield userModel_1.default.findById(userId).populate('reports');
        // Check if the user is not found
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Return a JSON response with the user's reports
        return res.status(200).json({ reports: user.reports });
    }
    catch (err) {
        return res.status(500).json({ error: 'Database error' });
    }
});
// Function for updating a report
const updateReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract necessary data from the request body
    const { reportId, hours } = req.body;
    // Check if reportId or hours are not provided
    if (!reportId || !hours) {
        return res.status(400).json({ error: 'ReportId and hours are required' });
    }
    // Find the report based on its ID
    const report = yield reportModel_1.default.findById(reportId);
    // Check if the report is not found
    if (!report) {
        return res.status(404).json({
            error: 'Report not found'
        });
    }
    const currentDate = new Date();
    // Calculate the start and end dates of the previous month
    const startOfLastMonth = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(currentDate, 1));
    const endOfLastMonth = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(currentDate, 1));
    // Get the ISO week numbers for the start and end dates of the previous month
    const startWeekNumber = (0, date_fns_1.getISOWeek)(startOfLastMonth);
    const endWeekNumber = (0, date_fns_1.getISOWeek)(endOfLastMonth);
    // Check if the report's week number falls within the range of the previous month
    if (!(report.weekNumber.valueOf() >= startWeekNumber &&
        report.weekNumber.valueOf() <= endWeekNumber &&
        report.year === (0, date_fns_1.getYear)(currentDate))) {
        return res.status(400).json({
            error: 'The report is not from the last month'
        });
    }
    // Update the hours of the report and save it
    report.hours = hours;
    yield report.save();
    // Return a JSON response indicating success
    return res.status(200).json({
        message: 'Report updated'
    });
});
exports.default = { addReport, getReports, updateReports };
