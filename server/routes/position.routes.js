import express from 'express';
import {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition
} from '../controller/position.controller.js';

const router = express.Router();

// Create a new position
router.post('/', createPosition);

// Get all positions
router.get('/', getAllPositions);

// Get single position by ID
router.get('/:id', getPositionById);

// Update position
router.put('/:id', updatePosition);

// Delete position
router.delete('/:id', deletePosition);

export default router; 