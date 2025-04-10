import mongoose from "mongoose";
import { departmentSchema } from "./department.model.js";

const teamSchema = new mongoose.Schema({
  department: {
    type: departmentSchema,
    required: [true, 'Department is required']
  },
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    minlength: [2, 'Team name must be at least 2 characters'],
    maxlength: [50, 'Team name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9\s-_]+$/.test(v);
      },
      message: 'Team name can only contain letters, numbers, spaces, hyphens and underscores'
    }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
teamSchema.index({ name: 1 });
teamSchema.index({ 'department.name': 1 });
teamSchema.index({ createdAt: 1 });

// Add compound index
teamSchema.index({ name: 1, 'department.name': 1 }, { unique: true });

const Team = mongoose.model("Team", teamSchema);
export { Team, teamSchema };
