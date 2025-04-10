import { Department } from '../model/department.model.js';
import { User } from '../model/user.model.js';
import { Team } from '../model/team.model.js';
import mongoose from 'mongoose';

// Create a new department
export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

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
      description: description || `Department ${name}`
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
      .sort({ name: 1 });

    // Get department heads
    const departmentHeads = await User.find({ role: 'department_head' })
      .select('name email teamId')
      .populate('teamId');

    // Map department heads to their departments
    const departmentsWithHeads = departments.map(dept => {
      const deptHead = departmentHeads.find(head =>
        head.teamId && head.teamId.departmentId &&
        head.teamId.departmentId.toString() === dept._id.toString()
      );
      return {
        ...dept.toObject(),
        head: deptHead ? {
          _id: deptHead._id,
          name: deptHead.name,
          email: deptHead.email
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departmentsWithHeads
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

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get department head
    const departmentHead = await User.findOne({
      role: 'department_head',
      'teamId.departmentId': id
    }).select('name email teamId').populate('teamId');

    const departmentData = {
      ...department.toObject(),
      head: departmentHead ? {
        _id: departmentHead._id,
        name: departmentHead.name,
        email: departmentHead.email
      } : null
    };

    res.status(200).json({
      success: true,
      data: departmentData
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
    const { name, description, isActive } = req.body;

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

    // Update department fields
    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    // Get updated department with head information
    const departmentHead = await User.findOne({
      role: 'department_head',
      'teamId.departmentId': id
    }).select('name email teamId').populate('teamId');

    const updatedDepartment = {
      ...department.toObject(),
      head: departmentHead ? {
        _id: departmentHead._id,
        name: departmentHead.name,
        email: departmentHead.email
      } : null
    };

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

    // Check if department has any teams
    const hasTeams = await Team.countDocuments({ departmentId: id });
    if (hasTeams > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with associated teams'
      });
    }

    await department.deleteOne();

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

// Get department by user ID
export const getDepartmentByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user and populate team
    const user = await User.findById(userId).populate({
      path: 'teamId',
      populate: {
        path: 'departmentId'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.teamId) {
      return res.status(404).json({ message: 'User is not assigned to any team' });
    }

    if (!user.teamId.departmentId) {
      return res.status(404).json({ message: 'Team is not assigned to any department' });
    }

    res.json(user.teamId.departmentId);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department', error: error.message });
  }
};

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
}; 