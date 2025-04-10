import express from 'express';
import {
  createTeam,
  getAllTeams,
  getTeamsByDepartment,
  getTeamById,
  updateTeam,
  deleteTeam
} from '../controller/team.controller.js';

const router = express.Router();

// Create a new team
router.post('/', createTeam);

// Get all teams
router.get('/', getAllTeams);

// Get teams by department
router.get('/department/:departmentId', getTeamsByDepartment);

// Get single team by ID
router.get('/:id', getTeamById);

// Update team
router.put('/:id', updateTeam);

// Delete team
router.delete('/:id', deleteTeam);

export default router; 