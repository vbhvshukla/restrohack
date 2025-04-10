import { Department } from '../model/department.model.js';
import { User } from '../model/user.model.js';
import mongoose from 'mongoose';

// Create a new department
export const createDepartment = async (req, res) => {
  try {
    const { name, headUserId, questionaire } = req.body;

    // Validate if the user exists and has appropriate role
    const headUser = await User.findById(headUserId);
    if (!headUser) {
      return res.status(404).json({
        success: false,
        message: 'Department head user not found'
      });
    }

    // Check if department name already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    // Create new department
    const department = new Department({
      name,
      headUserId,
      questionaire
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('headUserId', 'name email position')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

// Get single department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    const department = await Department.findById(id)
      .populate('headUserId', 'name email position');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message
    });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, headUserId, questionaire } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // If headUserId is being updated, validate the new user
    if (headUserId && headUserId !== department.headUserId.toString()) {
      const newHead = await User.findById(headUserId);
      if (!newHead) {
        return res.status(404).json({
          success: false,
          message: 'New department head user not found'
        });
      }
    }

    // If name is being updated, check for duplicates
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ name });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department with this name already exists'
        });
      }
    }

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { name, headUserId, questionaire },
      { new: true, runValidators: true }
    ).populate('headUserId', 'name email position');

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has any teams or users
    const hasTeams = await mongoose.model('Team').countDocuments({ 'department._id': id });
    const hasUsers = await User.countDocuments({ 'team.department._id': id });

    if (hasTeams > 0 || hasUsers > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with associated teams or users'
      });
    }

    await department.remove();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
}; 