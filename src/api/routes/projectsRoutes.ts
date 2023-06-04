import express from 'express';
import controller from '../controllers/projectsController';
import authenticateJWT from '../middlewares/authorization';

const router = express.Router();

router.post('/create', controller.addProject);
router.get('/all', authenticateJWT, controller.getProjects);

export = router;