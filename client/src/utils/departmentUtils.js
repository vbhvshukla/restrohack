import { v4 as uuidv4 } from 'uuid';

// Hardcoded departments array
// In a real application, this would come from a backend API
const departments = ['dev', 'sales', 'marketing'];

/**
 * Gets all departments
 * @returns {Array} Array of department strings
 */
export const getDepartments = () => {
	return [...departments];
};
