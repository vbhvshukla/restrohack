import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    minlength: [2, 'Department name must be at least 2 characters'],
    maxlength: [50, 'Department name cannot exceed 50 characters'],
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9\s-_]+$/.test(v);
      },
      message: 'Department name can only contain letters, numbers, spaces, hyphens and underscores'
    }
  },
  headUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'Department head is required'],
    validate: {
      validator: async function (v) {
        if (this.isNew || this.isModified('headUserId')) {
          const User = mongoose.model('User');
          const head = await User.findById(v);
          return !!head;
        }
        return true;
      },
      message: 'Department head user does not exist'
    }
  },
}, {
  timestamps: true
});

// Add indexes for better query performance
departmentSchema.index({ name: 1 }, { unique: true });
departmentSchema.index({ headUserId: 1 });
departmentSchema.index({ createdAt: 1 });

const Department = mongoose.model("Department", departmentSchema);
export { Department, departmentSchema };
