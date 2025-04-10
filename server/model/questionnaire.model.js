import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    trim: true
  },
  type: {
    type: String
  },
  options: {
    type: [String]
  }
});

const questionnaireSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  name: {
    type: String,
    trim: true
  },
  questions: {
    objective: {
      type: [questionSchema]
    },
    subjective: {
      type: [questionSchema]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);

export { questionnaireSchema };