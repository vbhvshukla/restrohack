import { User } from '../model/user.model.js';
import { Team } from '../model/team.model.js';
import { Position } from '../model/position.model.js';
import { Department } from '../model/department.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Inject admin user if none exists
export const injectAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    // Create default admin position
    const adminPosition = new Position({
      name: 'Administrator',
      level: 1
    });
    await adminPosition.save();

    // Create default admin department
    const adminDepartment = new Department({
      name: 'System',
      description: 'System Administration Department'
    });
    await adminDepartment.save();

    // Create default admin team
    const adminTeam = new Team({
      name: 'Administration',
      departmentId: adminDepartment._id
    });
    await adminTeam.save();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@restroworks.com',
      password: hashedPassword,
      positionId: adminPosition._id,
      teamId: adminTeam._id,
      role: 'admin'
    });

    await adminUser.save();

    // Remove password from response
    const userResponse = adminUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin user',
      error: error.message
    });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, positionId, teamId, role } = req.body;

    // Validate team exists
    const teamExists = await Team.findById(teamId);
    if (!teamExists) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Validate position exists
    const positionExists = await Position.findById(positionId);
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
      positionId,
      teamId: teamId || null,
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

// Get all users with populated references
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('positionId')
      .populate('teamId')
      .sort({ 'teamId.name': 1, 'positionId.level': 1, name: 1 });

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

    const users = await User.find({ teamId })
      .select('-password')
      .populate('positionId')
      .populate('teamId')
      .sort({ 'positionId.level': 1, name: 1 });

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

// Get single user by ID with populated references
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findById(id)
      .select('-password')
      .populate('positionId')
      .populate('teamId');

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
    const { name, email, password, positionId, teamId, role } = req.body;

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
    if (teamId && teamId !== user.teamId.toString()) {
      const newTeam = await Team.findById(teamId);
      if (!newTeam) {
        return res.status(404).json({
          success: false,
          message: 'New team not found'
        });
      }
    }

    // If position is being updated, validate the new position
    if (positionId && positionId !== user.positionId.toString()) {
      const newPosition = await Position.findById(positionId);
      if (!newPosition) {
        return res.status(404).json({
          success: false,
          message: 'New position not found'
        });
      }
    }

    // If email is being updated, check if it already exists
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (teamId) user.teamId = teamId;
    if (positionId) user.positionId = positionId;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Get updated user with populated references
    const updatedUser = await User.findById(id)
      .select('-password')
      .populate('positionId')
      .populate('teamId');

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

    await user.deleteOne();

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