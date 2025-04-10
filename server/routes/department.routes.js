import express from 'express';
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentByUserId
} from '../controller/department.controller.js';

const router = express.Router();

// Create a new department
router.post('/', createDepartment);

// Get all departments
router.get('/', getAllDepartments);

// Get single department by ID
router.get('/:id', getDepartmentById);

// Update department
router.put('/:id', updateDepartment);

// Delete department
router.delete('/:id', deleteDepartment);

// Get department by user id

router.get("/departmentbyuser/:userId", getDepartmentByUserId);

export default router; 