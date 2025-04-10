import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['objective', 'subjective'],
    required: [true, 'Question type is required']
  },
  options: {
    type: [String],
    required: function() {
      return this.type === 'objective';
    }
  }
});

const questionnaireSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  name: {
    type: String,
    required: [true, 'Questionnaire name is required'],
    trim: true
  },
  questions: {
    objective: {
      type: [questionSchema],
      validate: {
        validator: function(v) {
          return v.length === 5;
        },
        message: 'Must have exactly 5 objective questions'
      }
    },
    subjective: {
      type: [questionSchema],
      validate: {
        validator: function(v) {
          return v.length === 1;
        },
        message: 'Must have exactly 1 subjective question'
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
questionnaireSchema.index({ departmentId: 1, isActive: 1 });
questionnaireSchema.index({ createdAt: 1 });

export const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema); 