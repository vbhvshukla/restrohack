import { Team } from '../model/team.model.js';
import { Department } from '../model/department.model.js';
import { User } from '../model/user.model.js';
import mongoose from 'mongoose';

// Create a new team
export const createTeam = async (req, res) => {
  try {
    const { name, departmentId } = req.body;

    // Validate department exists
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if team name already exists in the same department
    const existingTeam = await Team.findOne({
      name,
      departmentId
    });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team with this name already exists in this department'
      });
    }

    // Create new team
    const team = new Team({
      name,
      departmentId
    });

    await team.save();

    // Populate department reference
    await team.populate('departmentId');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating team',
      error: error.message
    });
  }
};

// Get all teams with populated references
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('departmentId')
      .sort({ 'departmentId.name': 1, name: 1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teams',
      error: error.message
    });
  }
};

// Get teams by department
export const getTeamsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    const teams = await Team.find({ departmentId })
      .populate('departmentId')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams by department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teams by department',
      error: error.message
    });
  }
};

// Get single team by ID with populated references
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID'
      });
    }

    const team = await Team.findById(id).populate('departmentId');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team',
      error: error.message
    });
  }
};

// Update team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, departmentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID'
      });
    }

    // Check if team exists
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // If department is being updated, validate the new department
    if (departmentId && departmentId !== team.departmentId.toString()) {
      const newDepartment = await Department.findById(departmentId);
      if (!newDepartment) {
        return res.status(404).json({
          success: false,
          message: 'New department not found'
        });
      }
    }

    // If name is being updated, check for duplicates in the same department
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({
        name,
        departmentId: departmentId || team.departmentId
      });
      if (existingTeam && existingTeam._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Team with this name already exists in this department'
        });
      }
    }

    // Update team fields
    if (name) team.name = name;
    if (departmentId) team.departmentId = departmentId;

    await team.save();

    // Get updated team with populated references
    const updatedTeam = await Team.findById(id).populate('departmentId');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team',
      error: error.message
    });
  }
};

// Delete team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID'
      });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if team has any users
    const hasUsers = await User.countDocuments({ teamId: id });
    if (hasUsers > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete team with associated users'
      });
    }

    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting team',
      error: error.message
    });
  }
}; 