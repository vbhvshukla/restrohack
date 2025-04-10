import mongoose from "mongoose";
import { teamSchema } from "./team.model.js";
import { positionSchema } from "./position.model.js";

// Create a simplified user embed schema
const userEmbedSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
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
      required: [true, 'Feedback giver is required']
    },
    toUser: {
      type: userEmbedSchema,
      required: [true, 'Feedback receiver is required']
    },
    questionnaireId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questionnaire',
      required: [true, 'Questionnaire is required']
    },
    feedbackType: {
      type: String,
      enum: ['bySenior', 'byJunior', 'byPeer', 'byCollaborator'],
      required: [true, 'Feedback type is required']
    },
    responses: {
      objective: [{
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        answer: {
          type: String,
          required: true
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 5
        }
      }],
      subjective: {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        answer: {
          type: String,
          required: true,
          trim: true
        }
      }
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'archived'],
      default: 'draft'
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: 0,
      max: 1
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better query performance
feedbackSchema.index({ 'fromUser._id': 1, 'toUser._id': 1 });
feedbackSchema.index({ 'toUser._id': 1, status: 1 });
feedbackSchema.index({ questionnaireId: 1 });
feedbackSchema.index({ feedbackType: 1 });
feedbackSchema.index({ createdAt: 1 });

// Add validation to ensure feedback is only given to appropriate levels
feedbackSchema.pre('save', async function (next) {
  const fromLevel = this.fromUser.position.level;
  const toLevel = this.toUser.position.level;

  if (this.feedbackType === 'bySenior' && fromLevel <= toLevel) {
    next(new Error('Senior feedback can only be given by higher level employees'));
  } else if (this.feedbackType === 'byJunior' && fromLevel >= toLevel) {
    next(new Error('Junior feedback can only be given by lower level employees'));
  } else if (this.feedbackType === 'byPeer' && fromLevel !== toLevel) {
    next(new Error('Peer feedback can only be given by same level employees'));
  } else if (this.feedbackType === 'byCollaborator' &&
    this.fromUser.team.department._id.toString() === this.toUser.team.department._id.toString()) {
    next(new Error('Collaborator feedback can only be given by employees from different departments'));
  }

  next();
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);
