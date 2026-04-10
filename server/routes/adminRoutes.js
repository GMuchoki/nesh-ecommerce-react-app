import express from 'express';
import { createStaff } from '../controllers/adminController.js';

const router = express.Router();

router.post('/create-staff', createStaff);

export default router;
