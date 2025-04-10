import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
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


userSchema.methods.generateTokens = function () {
  const payload = {
    id: this._id,
    role: this.role
  };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, { expiresIn: '7d' });
  return { accessToken, refreshToken }
}

const User = mongoose.model("User", userSchema);
export { User, userSchema };
