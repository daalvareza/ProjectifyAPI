import { Request, Response } from "express";
import Report from "../models/reportModel";
import User from "../models/userModel";
import Project from "../models/projectModel";
import { endOfMonth, getISOWeek, getYear, startOfMonth, subMonths } from "date-fns";

// Function for adding a new report
const addReport = async (req: Request, res: Response) => {
    // Extract necessary data from the request body
    const { userId, projectId, weekNumber, hours, year } = req.body;

    // Find the user and project based on their IDs
    const user = await User.findById(userId);
    const project = await Project.findById(projectId);

    // Check if the user or project is not found
    if (!user || !project) {
        return res.status(404).json({
            error: 'User or project not found'
        });
    }

    // Check if a report for the same week and project already exists
    const existingReport = await Report.findOne({ user: userId, project: projectId, weekNumber, year });

    if (existingReport) {
        return res.status(409).json({
            error: 'Report for this week and project already exists'
        });
    }

    // Retrieve all reports for the given user and week
    const weekReportHours = await Report.find({ user: userId, weekNumber, year });

    // Calculate the total hours for the week
    const totalHours = weekReportHours.reduce((sum, entry) => sum + entry.hours.valueOf(), 0);

    // Check if the total hours exceed the limit of 45
    if (totalHours + hours > 45) {
        return res.status(400).json({
            error: 'Total hours for this week exceed the limit of 45'
        });
    }

    // Create a new report instance
    const newReport = new Report({ user: userId, project: projectId, weekNumber, hours, year });

     // Update user and project associations
     user.reports.push(newReport._id);
     project.reports.push(newReport._id);
 
     if (!user.projects.includes(projectId)) {
         user.projects.push(project._id);
     }
 
     if (!project.users.includes(userId)) {
         project.users.push(user._id);
     }
 
     await user.save();
     await project.save();

    // Save the new report to the database
    await newReport.save()
        .then((report: any) => {
            return res.status(200).json({
                message: `New report created: ${JSON.stringify(report)}`
            });
        })
        .catch((error: any) => {
            return res.status(400).json({
                error: error
            });
        });    
}

// Function for getting reports for a user
const getReports = async (req: Request, res: Response) => {
    // Get the user ID from the query parameters
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'UserId is required' });
    }

    try {
        // Find the user and populate the associated reports
        const user = await User.findById(userId).populate('reports');

        // Check if the user is not found
        if (!user) {
        return res.status(404).json({ error: 'User not found' });
        }

        // Return a JSON response with the user's reports
        return res.status(200).json({ reports: user.reports });
    } catch (err) {
        return res.status(500).json({ error: 'Database error' });
    }
}

// Function for updating a report
const updateReports = async (req: Request, res: Response) => {
    // Extract necessary data from the request body
    const { reportId, hours } = req.body;

    // Check if reportId or hours are not provided
    if (!reportId || !hours) {
        return res.status(400).json({ error: 'ReportId and hours are required' });
    }

    // Find the report based on its ID
    const report = await Report.findById(reportId);

    // Check if the report is not found
    if (!report) {
        return res.status(404).json({
            error: 'Report not found'
        });
    }

    const currentDate = new Date();

    // Calculate the start and end dates of the previous month
    const startOfLastMonth = startOfMonth(subMonths(currentDate, 1));
    const endOfLastMonth = endOfMonth(subMonths(currentDate, 1));

    // Get the ISO week numbers for the start and end dates of the previous month
    const startWeekNumber = getISOWeek(startOfLastMonth);
    const endWeekNumber = getISOWeek(endOfLastMonth);

    // Check if the report's week number falls within the range of the previous month
    if (!(report.weekNumber.valueOf() >= startWeekNumber &&
        report.weekNumber.valueOf() <= endWeekNumber &&
        report.year === getYear(currentDate))) {
        return res.status(400).json({
            error: 'The report is not from the last month'
        });
    }

    // Update the hours of the report and save it
    report.hours = hours;
    await report.save();

    // Return a JSON response indicating success
    return res.status(200).json({
        message: 'Report updated'
    });
}

export default { addReport, getReports, updateReports };