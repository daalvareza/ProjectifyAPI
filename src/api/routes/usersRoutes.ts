import express from 'express';
import controller from '../controllers/userController';

const router = express.Router();

router.post('/create', controller.addUser);
router.post('/login', controller.login);

export = router;