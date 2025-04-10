import mongoose from "mongoose";
import { teamSchema } from "./team.modal";
import { positionSchema } from "./position.modal";

const userSchema = new mongoose.Schema({
  position: {
    type: positionSchema,
    required: [true, 'Position is required']
  },
  team: {
    type: teamSchema,
    required: [true, 'Team is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s-]+$/.test(v);
      },
      message: 'Name can only contain letters, spaces and hyphens'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'deptHead', 'user'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'team.name': 1 });
userSchema.index({ 'position.name': 1 });
userSchema.index({ createdAt: 1 });

// Add compound indexes
userSchema.index({ 'team.name': 1, 'position.level': 1 });

// Add pre-save middleware for email lowercase conversion
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
