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
    position: positionSchema,
    team: teamSchema,
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    fromUser: {
      type: userEmbedSchema
    },
    toUser: {
      type: userEmbedSchema
    },
    questionnaireId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questionnaire'
    },
    feedbackType: {
      type: String
    },
    responses: {
      objective: [{
        questionId: {
          type: mongoose.Schema.Types.ObjectId
        },
        answer: {
          type: String
        },
        score: {
          type: Number
        }
      }],
      subjective: {
        questionId: {
          type: mongoose.Schema.Types.ObjectId
        },
        answer: {
          type: String,
          trim: true
        }
      }
    },
    status: {
      type: String,
      default: 'draft'
    },
    weight: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);
