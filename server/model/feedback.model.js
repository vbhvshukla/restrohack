import mongoose from "mongoose";
import { teamSchema } from "./team.model.js";
import { positionSchema } from "./position.model.js";

// Create a simplified user embed schema
const userEmbedSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['admin', 'team_lead', 'department_head', 'user'],
      required: true
    },
    position: positionSchema,
    team: teamSchema,
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    fromUser: {
      type: userEmbedSchema,
      required: true
    },
    toUser: {
      type: userEmbedSchema,
      required: true
    },
    questionnaireId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questionnaire',
      required: true
    },
    feedbackType: {
      type: String,
      enum: ['senior_to_junior', 'junior_to_senior', 'peer_to_peer', 'cross_team'],
      required: true
    },
    responses: {
      objective: [{
        questionId: {
          type: mongoose.Schema.Types.ObjectId
        },
        score: {
          type: Number,
          min: 1,
          max: 5
        }
      }],
      subjective: [{
        questionId: {
          type: mongoose.Schema.Types.ObjectId
        },
        answer: {
          type: String,
          trim: true
        }
      }]
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed', 'approved', 'rejected'],
      default: 'draft'
    },
    weight: {
      type: Number,
      default: 1
    },
    reviewDate: {
      type: Date
    },
    reviewedBy: {
      type: userEmbedSchema
    }
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to validate feedback relationships and calculate weight
feedbackSchema.pre('save', function (next) {
  const fromUser = this.fromUser;
  const toUser = this.toUser;

  // Basic validation
  if (fromUser._id.toString() === toUser._id.toString()) {
    throw new Error('Cannot give feedback to yourself');
  }

  // Determine feedback type based on position levels and teams
  if (fromUser.team._id.toString() !== toUser.team._id.toString()) {
    this.feedbackType = 'cross_team';
  } else {
    const fromPositionLevel = fromUser.position.level;
    const toPositionLevel = toUser.position.level;

    if (fromPositionLevel > toPositionLevel) {
      this.feedbackType = 'senior_to_junior';
    } else if (fromPositionLevel < toPositionLevel) {
      this.feedbackType = 'junior_to_senior';
    } else {
      this.feedbackType = 'peer_to_peer';
    }
  }

  // Simple weight calculation based on feedback type
  switch (this.feedbackType) {
    case 'senior_to_junior':
      this.weight = 1.5;
      break;
    case 'peer_to_peer':
      this.weight = 1.0;
      break;
    case 'junior_to_senior':
      this.weight = 0.7;
      break;
    case 'cross_team':
      this.weight = 0.5;
      break;
  }

  next();
});

// Add validation for status transitions
feedbackSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.status) {
    const validTransitions = {
      draft: ['submitted'],
      submitted: ['reviewed'],
      reviewed: ['approved', 'rejected'],
      approved: [],
      rejected: []
    };

    const currentStatus = this._update.status || this._doc.status;
    if (!validTransitions[currentStatus]?.includes(update.status)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${update.status}`);
    }

    // Require reviewedBy when status changes to reviewed/approved/rejected
    if (['reviewed', 'approved', 'rejected'].includes(update.status) && !update.reviewedBy) {
      throw new Error('reviewedBy is required when status changes to reviewed/approved/rejected');
    }
  }

  next();
});

// Indexes for better query performance
feedbackSchema.index({ 'fromUser._id': 1 });
feedbackSchema.index({ 'toUser._id': 1 });
feedbackSchema.index({ feedbackType: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ reviewDate: 1 });
feedbackSchema.index({ 'fromUser.team._id': 1, 'toUser.team._id': 1 });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
