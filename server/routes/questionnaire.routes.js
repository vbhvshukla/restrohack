import express from 'express';
import {
    createQuestionnaire,
    getQuestionnaires,
    getQuestionnaireById,
    updateQuestionnaire,
    deleteQuestionnaire
} from '../controller/questionnaire.controller.js';

const router = express.Router();

// Create a new questionnaire
router.post('/', createQuestionnaire);

// Get all questionnaires with pagination
router.get('/', getQuestionnaires);

// Get a single questionnaire by ID
router.get('/:id', getQuestionnaireById);

// Update a questionnaire
router.put('/:id', updateQuestionnaire);

// Delete a questionnaire
router.delete('/:id', deleteQuestionnaire);

export default router; 