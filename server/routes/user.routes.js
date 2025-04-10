import express from 'express';
import {
  createUser,
  getAllUsers,
  getUsersByTeam,
  getUserById,
  updateUser,
  deleteUser
} from '../controller/user.controller.js';

const router = express.Router();

// Create a new user
router.post('/', createUser);

// Get all users
router.get('/', getAllUsers);

// Get users by team
router.get('/team/:teamId', getUsersByTeam);

// Get single user by ID
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

export default router; 