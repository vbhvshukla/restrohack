import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for better query performance
departmentSchema.index({ name: 1 });

const Department = mongoose.model("Department", departmentSchema);
export { Department, departmentSchema };
