import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Add index for better query performance
teamSchema.index({ departmentId: 1 });

const Team = mongoose.model("Team", teamSchema);
export { Team, teamSchema };
