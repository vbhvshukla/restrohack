import { Position } from '../model/position.model.js';
import mongoose from 'mongoose';

// Create a new position
export const createPosition = async (req, res) => {
  try {
    const { name, level, parentId, childId } = req.body;

    // Validate parent position exists
    const parentPosition = await Position.findById(parentId);
    if (!parentPosition) {
      return res.status(404).json({
        success: false,
        message: 'Parent position not found'
      });
    }

    // Check if position name already exists at the same level
    const existingPosition = await Position.findOne({ name, level });
    if (existingPosition) {
      return res.status(400).json({
        success: false,
        message: 'Position with this name and level already exists'
      });
    }

    // Create new position
    const position = new Position({
      name,
      level,
      parentId,
      childId: childId || []
    });

    await position.save();

    // Update parent's childId array
    if (!parentPosition.childId.includes(position._id)) {
      parentPosition.childId.push(position._id);
      await parentPosition.save();
    }

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

// Get all positions
export const getAllPositions = async (req, res) => {
  try {
    const positions = await Position.find()
      .populate('parentId', 'name level')
      .populate('childId', 'name level')
      .sort({ level: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: positions.length,
      data: positions
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

    const position = await Position.findById(id)
      .populate('parentId', 'name level')
      .populate('childId', 'name level');

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }

    res.status(200).json({
      success: true,
      data: position
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
    const { name, level, parentId, childId } = req.body;

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

    // If parentId is being updated, validate the new parent
    if (parentId && parentId !== position.parentId.toString()) {
      const newParent = await Position.findById(parentId);
      if (!newParent) {
        return res.status(404).json({
          success: false,
          message: 'New parent position not found'
        });
      }

      // Remove from old parent's childId array
      const oldParent = await Position.findById(position.parentId);
      if (oldParent) {
        oldParent.childId = oldParent.childId.filter(
          childId => childId.toString() !== id
        );
        await oldParent.save();
      }

      // Add to new parent's childId array
      if (!newParent.childId.includes(id)) {
        newParent.childId.push(id);
        await newParent.save();
      }
    }

    // If name or level is being updated, check for duplicates
    if ((name && name !== position.name) || (level && level !== position.level)) {
      const existingPosition = await Position.findOne({
        name: name || position.name,
        level: level || position.level
      });
      if (existingPosition && existingPosition._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Position with this name and level already exists'
        });
      }
    }

    // Update position
    const updatedPosition = await Position.findByIdAndUpdate(
      id,
      { name, level, parentId, childId },
      { new: true, runValidators: true }
    )
      .populate('parentId', 'name level')
      .populate('childId', 'name level');

    res.status(200).json({
      success: true,
      message: 'Position updated successfully',
      data: updatedPosition
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

    // Check if position has any children
    if (position.childId.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete position with child positions'
      });
    }

    // Remove from parent's childId array
    const parent = await Position.findById(position.parentId);
    if (parent) {
      parent.childId = parent.childId.filter(
        childId => childId.toString() !== id
      );
      await parent.save();
    }

    await position.remove();

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