import express from 'express';
import controller from '../controllers/reportsController';
import authenticateJWT from '../middlewares/authorization';

const router = express.Router();

router.post('/create', authenticateJWT, controller.addReport);
router.get('/', authenticateJWT, controller.getReports);
router.put('/update', authenticateJWT, controller.updateReports);

export = router;