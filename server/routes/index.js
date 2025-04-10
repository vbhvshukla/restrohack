import express from 'express';
import departmentRoutes from './department.routes.js';
import positionRoutes from './position.routes.js';
import teamRoutes from './team.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

// API routes
router.use('/api/departments', departmentRoutes);
router.use('/api/positions', positionRoutes);
router.use('/api/teams', teamRoutes);
router.use('/api/users', userRoutes);

export default router; 