import { User } from '../model/user.model.js';
import { Team } from '../model/team.model.js';
import { Position } from '../model/position.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, position, team, role } = req.body;

    // Validate team exists
    const teamExists = await Team.findById(team._id);
    if (!teamExists) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Validate position exists
    const positionExists = await Position.findById(position._id);
    if (!positionExists) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      position,
      team,
      role: role || 'user'
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ 'team.name': 1, 'position.level': 1, name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get users by team
export const getUsersByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID'
      });
    }

    const users = await User.find({ 'team._id': teamId })
      .select('-password')
      .sort({ 'position.level': 1, name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users by team:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users by team',
      error: error.message
    });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, position, team, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If team is being updated, validate the new team
    if (team && team._id !== user.team._id.toString()) {
      const newTeam = await Team.findById(team._id);
      if (!newTeam) {
        return res.status(404).json({
          success: false,
          message: 'New team not found'
        });
      }
    }

    // If position is being updated, validate the new position
    if (position && position._id !== user.position._id.toString()) {
      const newPosition = await Position.findById(position._id);
      if (!newPosition) {
        return res.status(404).json({
          success: false,
          message: 'New position not found'
        });
      }
    }

    // If email is being updated, check for duplicates
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name: name || user.name,
      email: email ? email.toLowerCase() : user.email,
      position: position || user.position,
      team: team || user.team,
      role: role || user.role
    };

    // If password is being updated, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a department head
    if (user.role === 'deptHead') {
      const department = await mongoose.model('Department').findOne({ headUserId: id });
      if (department) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete user who is a department head'
        });
      }
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
}; 