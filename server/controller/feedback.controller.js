import mongoose from "mongoose";
import { Feedback } from '../model/feedback.model.js';
import { Questionnaire } from '../model/questionnaire.model.js';
import { User } from '../model/user.model.js';

// Create a new feedback
export const createFeedback = async (req, res) => {
  try {
    const { fromUserId, toUserId, questionnaireId, feedbackType, responses, weight } = req.body;

    // Validate users exist
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId)
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({ 
        message: !fromUser ? 'From user not found' : 'To user not found' 
      });
    }

    // Validate questionnaire exists
    const questionnaire = await Questionnaire.findById(questionnaireId);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    // Create user embed objects
    const fromUserEmbed = {
      _id: fromUser._id,
      name: fromUser.name,
      email: fromUser.email,
      position: fromUser.position,
      team: fromUser.team
    };

    const toUserEmbed = {
      _id: toUser._id,
      name: toUser.name,
      email: toUser.email,
      position: toUser.position,
      team: toUser.team
    };

    // Create feedback
    const feedback = new Feedback({
      fromUser: fromUserEmbed,
      toUser: toUserEmbed,
      questionnaireId,
      feedbackType,
      responses,
      weight
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating feedback', error: error.message });
  }
};

// Get all feedbacks with pagination and filters
export const getFeedbacks = async (req, res) => {
  try {
    const { 
      limit = 10, 
      skip = 0, 
      page = 1,
      fromUserId,
      toUserId,
      questionnaireId,
      feedbackType,
      status
    } = req.query;

    // Build query
    const query = {};
    if (fromUserId) query['fromUser._id'] = fromUserId;
    if (toUserId) query['toUser._id'] = toUserId;
    if (questionnaireId) query.questionnaireId = questionnaireId;
    if (feedbackType) query.feedbackType = feedbackType;
    if (status) query.status = status;

    // Calculate skip based on page
    const calculatedSkip = (page - 1) * limit;

    // Execute query with pagination
    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .skip(calculatedSkip)
        .limit(Number(limit))
        .populate('questionnaireId', 'name')
        .sort({ createdAt: -1 }),
      Feedback.countDocuments(query)
    ]);

    res.json({
      feedbacks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
  }
};

// Get a single feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('questionnaireId', 'name');
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
};

// Update a feedback
export const updateFeedback = async (req, res) => {
  try {
    const { responses, status, weight } = req.body;
    const feedbackId = req.params.id;

    // Find feedback
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Update fields if provided
    if (responses) feedback.responses = responses;
    if (status) feedback.status = status;
    if (weight !== undefined) feedback.weight = weight;

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating feedback', error: error.message });
  }
};

// Delete a feedback
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await feedback.deleteOne();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting feedback', error: error.message });
  }
};

// Get feedback statistics
export const getFeedbackStats = async (req, res) => {
  try {
    const { toUserId, questionnaireId } = req.query;

    const query = {};
    if (toUserId) query['toUser._id'] = toUserId;
    if (questionnaireId) query.questionnaireId = questionnaireId;

    const stats = await Feedback.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$feedbackType',
          count: { $sum: 1 },
          avgWeight: { $avg: '$weight' },
          avgScore: {
            $avg: {
              $reduce: {
                input: '$responses.objective',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.score'] }
              }
            }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback statistics', error: error.message });
  }
};

