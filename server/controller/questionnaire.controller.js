import { Questionnaire } from '../model/questionnaire.model.js';
import { Department } from '../model/department.model.js';

// Create a new questionnaire
export const createQuestionnaire = async (req, res) => {
    try {
        const { departmentId, name, questions } = req.body;

        // Validate department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Create questionnaire
        const questionnaire = new Questionnaire({
            departmentId,
            name,
            questions
        });

        await questionnaire.save();
        res.status(201).json(questionnaire);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating questionnaire', error: error.message });
    }
};

// Get all questionnaires with pagination
export const getQuestionnaires = async (req, res) => {
    try {
        const {
            limit = 10,
            skip = 0,
            page = 1,
            departmentId,
            isActive
        } = req.query;

        // Build query
        const query = {};
        if (departmentId) query.departmentId = departmentId;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        // Calculate skip based on page
        const calculatedSkip = (page - 1) * limit;

        // Execute query with pagination
        const [questionnaires, total] = await Promise.all([
            Questionnaire.find(query)
                .skip(calculatedSkip)
                .limit(Number(limit))
                .populate('departmentId', 'name')
                .sort({ createdAt: -1 }),
            Questionnaire.countDocuments(query)
        ]);

        res.json({
            questionnaires,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questionnaires', error: error.message });
    }
};

// Get a single questionnaire by ID
export const getQuestionnaireById = async (req, res) => {
    try {
        const questionnaire = await Questionnaire.findById(req.params.id)
            .populate('departmentId', 'name');

        if (!questionnaire) {
            return res.status(404).json({ message: 'Questionnaire not found' });
        }

        res.json(questionnaire);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questionnaire', error: error.message });
    }
};

// Update a questionnaire
export const updateQuestionnaire = async (req, res) => {
    try {
        const { name, questions, isActive } = req.body;
        const questionnaireId = req.params.id;

        // Find questionnaire
        const questionnaire = await Questionnaire.findById(questionnaireId);
        if (!questionnaire) {
            return res.status(404).json({ message: 'Questionnaire not found' });
        }

        // Update fields if provided
        if (name) questionnaire.name = name;
        if (questions) questionnaire.questions = questions;
        if (isActive !== undefined) questionnaire.isActive = isActive;

        await questionnaire.save();
        res.json(questionnaire);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating questionnaire', error: error.message });
    }
};

// Delete a questionnaire
export const deleteQuestionnaire = async (req, res) => {
    try {
        const questionnaire = await Questionnaire.findById(req.params.id);

        if (!questionnaire) {
            return res.status(404).json({ message: 'Questionnaire not found' });
        }

        await questionnaire.deleteOne();
        res.json({ message: 'Questionnaire deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting questionnaire', error: error.message });
    }
};
