import mongoose from "mongoose";
import { Feedback } from '../model/feedback.model.js';
import { Questionnaire } from '../model/questionnaire.model.js';
import { User } from '../model/user.model.js';
import { Position } from '../model/position.model.js';
import { Config } from '../model/config.model.js';

// Create a new feedback
export const createFeedback = async (req, res) => {
  try {
    const { fromUserId, toUserId, questionnaireId, responses } = req.body;

    // Validate users exist and populate their positions
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId).populate('positionId'),
      User.findById(toUserId).populate('positionId')
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({
        message: !fromUser ? 'From user not found' : 'To user not found'
      });
    }

    if (!fromUser.positionId || !toUser.positionId) {
      return res.status(400).json({
        message: 'Both users must have positions assigned'
      });
    }

    // Validate questionnaire exists
    const questionnaire = await Questionnaire.findById(questionnaireId);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    // Create user embed objects with position information
    const fromUserEmbed = {
      _id: fromUser._id,
      name: fromUser.name,
      email: fromUser.email,
      role: fromUser.role,
      position: {
        _id: fromUser.positionId._id,
        name: fromUser.positionId.name,
        level: fromUser.positionId.level
      },
      team: fromUser.teamId
    };

    const toUserEmbed = {
      _id: toUser._id,
      name: toUser.name,
      email: toUser.email,
      role: toUser.role,
      position: {
        _id: toUser.positionId._id,
        name: toUser.positionId.name,
        level: toUser.positionId.level
      },
      team: toUser.teamId
    };

    // Determine feedback type based on position levels
    let feedbackType;
    if (fromUser.teamId?.toString() !== toUser.teamId?.toString()) {
      feedbackType = 'cross_team';
    } else {
      const fromPositionLevel = fromUser.positionId.level;
      const toPositionLevel = toUser.positionId.level;

      if (fromPositionLevel > toPositionLevel) {
        feedbackType = 'senior_to_junior';
      } else if (fromPositionLevel < toPositionLevel) {
        feedbackType = 'junior_to_senior';
      } else {
        feedbackType = 'peer_to_peer';
      }
    }

    // Get weight from config based on feedback type
    const config = await Config.findOne().sort({ createdAt: -1 });
    if (!config) {
      return res.status(500).json({ message: 'Configuration not found' });
    }

    let weight;
    switch (feedbackType) {
      case 'senior_to_junior':
        weight = config.weights.bySenior;
        break;
      case 'junior_to_senior':
        weight = config.weights.byJunior;
        break;
      case 'peer_to_peer':
        weight = config.weights.byPeer;
        break;
      case 'cross_team':
        weight = config.weights.byCollaborator;
        break;
      default:
        weight = 1; // Default weight if feedback type is not recognized
    }

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
    const { userId, feedbackType, startDate, endDate } = req.query;

    const query = {};
    if (userId) query['toUser._id'] = userId;
    if (feedbackType) query.feedbackType = feedbackType;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get detailed statistics with weighted scores
    const stats = await Feedback.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$feedbackType',
          count: { $sum: 1 },
          weightedAvgScore: {
            $avg: {
              $multiply: [
                {
                  $reduce: {
                    input: '$responses.objective',
                    initialValue: 0,
                    in: { $add: ['$$value', '$$this.score'] }
                  }
                },
                '$weight'
              ]
            }
          },
          avgWeight: { $avg: '$weight' },
          feedbackTypes: {
            $push: {
              type: '$feedbackType',
              weight: '$weight',
              score: {
                $reduce: {
                  input: '$responses.objective',
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.score'] }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          feedbackType: '$_id',
          count: 1,
          weightedAvgScore: 1,
          avgWeight: 1,
          feedbackTypes: 1,
          _id: 0
        }
      }
    ]);

    // Calculate overall weighted average
    const overallStats = await Feedback.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalWeightedScore: {
            $sum: {
              $multiply: [
                {
                  $reduce: {
                    input: '$responses.objective',
                    initialValue: 0,
                    in: { $add: ['$$value', '$$this.score'] }
                  }
                },
                '$weight'
              ]
            }
          },
          totalWeight: { $sum: '$weight' }
        }
      },
      {
        $project: {
          overallWeightedAverage: {
            $divide: ['$totalWeightedScore', '$totalWeight']
          }
        }
      }
    ]);

    res.json({
      feedbackTypeStats: stats,
      overallStats: overallStats[0] || { overallWeightedAverage: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

