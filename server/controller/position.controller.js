import { Position } from '../model/position.model.js';
import { User } from '../model/user.model.js';
import mongoose from 'mongoose';

// Create a new position
export const createPosition = async (req, res) => {
  try {
    const { name, level, description } = req.body;

    // Check if position name already exists
    const existingPosition = await Position.findOne({ name });
    if (existingPosition) {
      return res.status(400).json({
        success: false,
        message: 'Position with this name already exists'
      });
    }

    // Create new position
    const position = new Position({
      name,
      level,
      description
    });

    await position.save();

    res.status(201).json({
      success: true,
      message: 'Position created successfully',
      data: position
    });
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating position',
      error: error.message
    });
  }
};

// Get all positions with hierarchy based on levels
export const getAllPositions = async (req, res) => {
  try {
    const positions = await Position.find()
      .sort({ level: 1, name: 1 });

    // Build position hierarchy based on levels
    const positionHierarchy = buildPositionHierarchy(positions);

    res.status(200).json({
      success: true,
      count: positions.length,
      data: positionHierarchy
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching positions',
      error: error.message
    });
  }
};

// Get positions by level
export const getPositionsByLevel = async (req, res) => {
  try {
    const { level } = req.params;

    const positions = await Position.find({ level: parseInt(level) })
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: positions.length,
      data: positions
    });
  } catch (error) {
    console.error('Error fetching positions by level:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching positions by level',
      error: error.message
    });
  }
};

// Get single position by ID
export const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid position ID'
      });
    }

    const position = await Position.findById(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }

    // Get positions at higher levels (potential children)
    const childPositions = await Position.find({ level: { $gt: position.level } })
      .select('name level')
      .sort({ level: 1, name: 1 });

    // Get positions at lower levels (potential parents)
    const parentPositions = await Position.find({ level: { $lt: position.level } })
      .select('name level')
      .sort({ level: -1, name: 1 });

    // Get users in this position
    const users = await User.find({ positionId: id })
      .select('name email role')
      .sort({ name: 1 });

    const positionData = {
      ...position.toObject(),
      potentialChildren: childPositions,
      potentialParents: parentPositions,
      users: users
    };

    res.status(200).json({
      success: true,
      data: positionData
    });
  } catch (error) {
    console.error('Error fetching position:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching position',
      error: error.message
    });
  }
};

// Update position
export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid position ID'
      });
    }

    // Check if position exists
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }

    // If name is being updated, check for duplicates
    if (name && name !== position.name) {
      const existingPosition = await Position.findOne({ name });
      if (existingPosition) {
        return res.status(400).json({
          success: false,
          message: 'Position with this name already exists'
        });
      }
    }

    // Update position fields
    if (name) position.name = name;
    if (level) position.level = level;
    if (description !== undefined) position.description = description;

    await position.save();

    res.status(200).json({
      success: true,
      message: 'Position updated successfully',
      data: position
    });
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating position',
      error: error.message
    });
  }
};

// Delete position
export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid position ID'
      });
    }

    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }

    // Check if position has any users
    const hasUsers = await User.countDocuments({ positionId: id });
    if (hasUsers > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete position with associated users'
      });
    }

    await position.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting position',
      error: error.message
    });
  }
};

// Helper function to build position hierarchy based on levels
const buildPositionHierarchy = (positions) => {
  // Group positions by level
  const positionsByLevel = {};
  positions.forEach(position => {
    if (!positionsByLevel[position.level]) {
      positionsByLevel[position.level] = [];
    }
    positionsByLevel[position.level].push(position.toObject());
  });

  // Sort levels
  const levels = Object.keys(positionsByLevel).map(Number).sort((a, b) => a - b);

  // Build hierarchy
  const hierarchy = [];
  levels.forEach(level => {
    hierarchy.push({
      level,
      positions: positionsByLevel[level]
    });
  });

  return hierarchy;
}; 