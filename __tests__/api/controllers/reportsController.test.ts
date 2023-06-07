import { Request, Response } from "express";
import Report, { ReportType } from "../../../src/api/models/reportModel";
import User, { UserType } from "../../../src/api/models/userModel";
import Project, { ProjectType } from "../../../src/api/models/projectModel";
import reportController from "../../../src/api/controllers/reportsController";
import mongoose from "mongoose";
import { getISOWeek, getYear, subMonths } from "date-fns";

jest.mock("../../../src/api/models/userModel");
jest.mock("../../../src/api/models/projectModel");
jest.mock("../../../src/api/models/reportModel");

describe("Report Controller", () => {
    let req: Request;
    let res: Response;
    let userId: string;
    let projectId: string;
    
    type MockUserType = {
        _id: mongoose.Types.ObjectId,
        username: string,
        password: string,
        projects: any[],
        reports: any[],
        save: jest.Mock,
        push?: jest.Mock,
        includes?: jest.Mock,
    };
    
    type MockProjectType = {
        _id: mongoose.Types.ObjectId,
        name: string,
        description: string,
        users: mongoose.Types.ObjectId[],
        reports: mongoose.Types.ObjectId[],
        save: jest.Mock,
        push?: jest.Mock,
        includes?: jest.Mock,
    }
    
    const mockReport : Partial<ReportType> = {
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn(),
    }
    
    jest.spyOn(Report.prototype, 'save').mockImplementationOnce(() => Promise.resolve(mockReport));
    
    beforeEach(() => {
        userId = new mongoose.Types.ObjectId().toString();
        projectId = new mongoose.Types.ObjectId().toString();
    
        req = {
            body: {
                userId,
                projectId,
                weekNumber: 1,
                hours: 10,
                year: 2023,
            },
            params: {
                userId,
                projectId,
            },
            query: {},
        } as any;
    
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("addReport", () => {      
        it("should add a new report and update user and project associations", async () => {
            const reportId = 'some fixed id value';
            const mockReportInstance = Object.assign(Object.create(Object.getPrototypeOf(mockReport)), {_id: reportId, ...mockReport});
            jest.spyOn(Report.prototype, 'save').mockImplementationOnce(() => Promise.resolve(mockReportInstance));
        
            const mockUser : MockUserType = {
                _id: new mongoose.Types.ObjectId(),
                username: "testUser",
                password: "testPassword",
                projects: [jest.fn(), jest.fn()],
                reports: [jest.fn(), jest.fn()],
                save: jest.fn(),
            };
        
            const mockProject : MockProjectType = {
                _id: new mongoose.Types.ObjectId(),
                name: "testProject",
                description: "testDescription",
                users: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
                reports: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
                save: jest.fn(),
            };
      
            mockUser.projects.includes = jest.fn().mockReturnValue(false);
            mockProject.users.includes = jest.fn().mockReturnValue(false);
        
            User.findById = jest.fn().mockResolvedValueOnce(mockUser);
            Project.findById = jest.fn().mockResolvedValueOnce(mockProject);
            Report.findOne = jest.fn().mockResolvedValueOnce(null);
            Report.find = jest.fn().mockResolvedValueOnce([]);
        
            const { userId, projectId } = req.params;
        
            res.json = jest.fn();
            
            await reportController.addReport(req, res);
      
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(Project.findById).toHaveBeenCalledWith(projectId);
            expect(Report.findOne).toHaveBeenCalledWith({
                user: userId,
                project: projectId,
                weekNumber: 1,
                year: 2023,
            });
            expect(Report.find).toHaveBeenCalledWith({
                user: userId,
                weekNumber: 1,
                year: 2023,
            });
            expect(Report.prototype.save).toHaveBeenCalledTimes(1);
            expect(mockUser.projects.includes).toHaveBeenCalledWith(projectId);
            expect(mockProject.users.includes).toHaveBeenCalledWith(userId);
            expect(mockUser.save).toHaveBeenCalledTimes(1);
            expect(mockProject.save).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledTimes(1);
            const actualReportId = JSON.parse((res.json as jest.Mock).mock.calls[0][0].message.split(': ')[1].trim())._id;
            expect(actualReportId).toBeDefined();
            expect(actualReportId).toMatch(/^[0-9a-fA-F]{24}$/);
        });
      
        it("should return an error when the user or project is not found", async () => {
            const { userId, projectId } = req.params;
        
            User.findById = jest.fn().mockResolvedValueOnce(null);
        
            await reportController.addReport(req, res);
        
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "User or project not found" });
        });
      
        it("should return an error when a report for the same week and project already exists", async () => {
            const mockExistingReport = { _id: "existingReportId" };
        
            const { userId, projectId } = req.params;
        
            User.findById = jest.fn().mockResolvedValueOnce({});
            Project.findById = jest.fn().mockResolvedValueOnce({});
            Report.findOne = jest.fn().mockResolvedValueOnce(mockExistingReport);
        
            await reportController.addReport(req, res);
        
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(Project.findById).toHaveBeenCalledWith(projectId);
            expect(Report.findOne).toHaveBeenCalledWith({
                user: userId,
                project: projectId,
                weekNumber: 1,
                year: 2023,
            });
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                error: "Report for this week and project already exists",
            });
        });
      
        it("should return an error when the total hours for the week exceed the limit", async () => {
            const mockReports = [
                { _id: "report1", hours: 20 },
                { _id: "report2", hours: 25 },
            ];
      
            const { userId, projectId } = req.params;
        
            User.findById = jest.fn().mockResolvedValueOnce({
                _id: new mongoose.Types.ObjectId(),
                username: "testUser",
                password: "testPassword",
                reports: [],
                projects: [],
                save: jest.fn(),
            });
            Project.findById = jest.fn().mockResolvedValueOnce({
                _id: new mongoose.Types.ObjectId(),
                name: "testProject",
                description: "testDescription",
                users: [],
                reports: [],
                save: jest.fn(),
            });
            Report.findOne = jest.fn().mockResolvedValueOnce(null);
            Report.find = jest.fn().mockResolvedValueOnce(mockReports);
      
            await reportController.addReport(req, res);
        
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(Project.findById).toHaveBeenCalledWith(projectId);
            expect(Report.findOne).toHaveBeenCalledWith({
                user: userId,
                project: projectId,
                weekNumber: 1,
                year: 2023,
            });
            expect(Report.find).toHaveBeenCalledWith({
                user: userId,
                weekNumber: 1,
                year: 2023,
            });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Total hours for this week exceed the limit of 45",
            });
        });
    });

    describe('getReports', () => {
        it('should return 404 if the user is not found', async () => {
            const userId = new mongoose.Types.ObjectId();
            const findByIdSpy = jest.fn().mockReturnValueOnce({
                populate: jest.fn().mockReturnValue(Promise.resolve(null)),
            });
            User.findById = findByIdSpy;
            req.query.userId = userId.toString();
            res.status = jest.fn().mockReturnThis();
            res.json = jest.fn();
        
            await reportController.getReports(req, res);
      
            expect(findByIdSpy).toHaveBeenCalledWith(userId.toString());
            expect(User.findById).toHaveBeenCalledWith(userId.toString());
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
      
        it('should return the user reports', async () => {
            const userId = new mongoose.Types.ObjectId();
            const reports = [{ _id: new mongoose.Types.ObjectId() }, { _id: new mongoose.Types.ObjectId() }];
            const user = { _id: userId, reports };
            const findByIdSpy = jest.fn().mockReturnValueOnce({
                populate: jest.fn().mockReturnValue(Promise.resolve(user)),
            });
            User.findById = findByIdSpy;
            req.query.userId = userId.toString();
            res.status = jest.fn().mockReturnThis();
            res.json = jest.fn();
      
            await reportController.getReports(req, res);
        
            expect(findByIdSpy).toHaveBeenCalledWith(userId.toString());
            expect(User.findById).toHaveBeenCalledWith(userId.toString());
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ reports: user.reports });
        });

        it('should return 400 if userId is not provided', async () => {
            req.query.userId = undefined;
            res.status = jest.fn().mockReturnThis();
            res.json = jest.fn();
        
            await reportController.getReports(req, res);
        
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'UserId is required' });
        });
    });
      
    describe('updateReports', () => {
        it('should return 404 if the report is not found', async () => {
            const reportId = new mongoose.Types.ObjectId();
            Report.findById = jest.fn().mockResolvedValueOnce(null);
            req.body.reportId = reportId;
            res.status = jest.fn().mockReturnThis();
            res.json = jest.fn();
        
            await reportController.updateReports(req, res);
        
            expect(Report.findById).toHaveBeenCalledWith(reportId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Report not found' });
        });

        it('should return 400 if reportId or hours is not provided', async () => {
            req.body = {};
            res.status = jest.fn().mockReturnThis();
            res.json = jest.fn();
        
            await reportController.updateReports(req, res);
        
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'ReportId and hours are required' });
        });
        
        it('should return 404 if the report is not found', async () => {
            const reportId = new mongoose.Types.ObjectId();
            Report.findById = jest.fn().mockResolvedValue(null);
            req.body = { reportId, hours: 10 };
            res.status = jest.fn().mockReturnThis();
            res.json = jest.fn();
        
            await reportController.updateReports(req, res);
        
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Report not found' });
        });
        
        it('should return 400 if the report is not from the last month', async () => {
            const reportId = new mongoose.Types.ObjectId();
            const report = {
                _id: reportId,
                weekNumber: getISOWeek(subMonths(new Date(), 2)),
                year: getYear(new Date()),
                save: jest.fn()
            };
            Report.findById = jest.fn().mockImplementation((id) => {
                return new Promise((resolve, reject) => {
                    if (id === reportId) {
                        resolve(report);
                    } else {
                        reject('Report not found');
                    }
                });
            });
            req.body = { reportId, hours: 10 };
            res.status = jest.fn().mockReturnThis();
            res.json = jest.fn();
        
            await reportController.updateReports(req, res);
        
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The report is not from the last month' });
        });
        
        it('should return 200 and update the report if all checks pass', async () => {
            const reportId = new mongoose.Types.ObjectId();
            const report = {
                _id: reportId,
                weekNumber: getISOWeek(subMonths(new Date(), 1)),
                year: getYear(new Date()),
                hours: 5,
                save: jest.fn(),
            }
            Report.findById = jest.fn().mockImplementation((id) => {
                return new Promise((resolve, reject) => {
                    if (id === reportId) {
                        resolve(report);
                    } else {
                        reject('Report not found');
                    }
                });
            });
            req.body = { reportId, hours: 10 };
            res.status = jest.fn().mockReturnThis();
            res.json = jest.fn();

            await reportController.updateReports(req, res);

            expect(Report.findById).toHaveBeenCalledWith(reportId);
            expect(report.hours).toBe(10);
            expect(report.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Report updated' });
        });
    }); 
});