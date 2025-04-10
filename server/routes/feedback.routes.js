import express from 'express';
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats
} from '../controller/feedback.controller.js';

const router = express.Router();

// Create a new feedback
router.post('/', createFeedback);

// Get all feedbacks with pagination and filters
router.get('/', getFeedbacks);

// Get feedback statistics
router.get('/stats', getFeedbackStats);

// Get a single feedback by ID
router.get('/:id', getFeedbackById);

// Update a feedback
router.put('/:id', updateFeedback);

// Delete a feedback
router.delete('/:id', deleteFeedback);

export default router; 