import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position"
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'team_lead', 'department_head'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Add pre-save middleware for email lowercase conversion
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.model("User", userSchema);
export { User, userSchema };
