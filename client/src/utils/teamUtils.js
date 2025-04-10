import teamsData from '../data/teams.json';
import { v4 as uuidv4 } from 'uuid';

// Create a copy of the teams data that we can modify
let teamsState = [...teamsData];

/**
 * Gets all teams from the data source
 * @returns {Array} Array of team objects
 */
export const getTeams = () => {
	return teamsState;
};

/**
 * Gets a team by its ID
 * @param {string} teamId - The team ID
 * @returns {Object|null} The team object or null if not found
 */
export const getTeamById = (teamId) => {
	return teamsState.find((team) => team.id === teamId) || null;
};

/**
 * Creates a new team with the selected employees
 * @param {string} teamName - Name of the team
 * @param {Array} selectedEmployees - Array of employee objects to add to the team
 * @returns {Object} The created team
 */
export const createTeam = (teamName, selectedEmployees) => {
	// Check if team has at least one position 1 (department head)
	const hasPositionOne = selectedEmployees.some((emp) => emp.position === 1);
	if (!hasPositionOne) {
		throw new Error(
			'A team must have exactly one position 1 (department head)'
		);
	}

	// Count position 1 employees
	const positionOneCount = selectedEmployees.filter(
		(emp) => emp.position === 1
	).length;
	if (positionOneCount > 1) {
		throw new Error(
			'A team cannot have more than one position 1 (department head)'
		);
	}

	const newTeam = {
		id: `team-${uuidv4().slice(0, 8)}`,
		name: teamName,
		members: selectedEmployees.map((emp) => ({
			id: emp.id || `${emp.department}-${emp.position}-${uuidv4().slice(0, 8)}`,
			name: emp.name,
			email: emp.email,
			department: emp.department,
			position: emp.position,
		})),
	};

	// Add the new team to our state
	teamsState.push(newTeam);

	return newTeam;
};

/**
 * Adds an employee to a team
 * @param {string} teamId - The team ID
 * @param {Object} employee - The employee to add
 * @returns {Object|null} The updated team or null if team not found
 */
export const addEmployeeToTeam = (teamId, employee) => {
	const team = getTeamById(teamId);
	if (!team) return null;

	// Check if employee is already in the team
	if (team.members.some((member) => member.email === employee.email)) {
		return team;
	}

	// Check if trying to add position 1 when team already has one
	if (employee.position === 1) {
		const hasPositionOne = team.members.some((emp) => emp.position === 1);
		if (hasPositionOne) {
			throw new Error('The team already has a position 1 employee');
		}
	}

	team.members.push({
		id:
			employee.id ||
			`${employee.department}-${employee.position}-${uuidv4().slice(0, 8)}`,
		name: employee.name,
		email: employee.email,
		department: employee.department,
		position: employee.position,
	});

	return team;
};

/**
 * Removes an employee from a team
 * @param {string} teamId - The team ID
 * @param {string} employeeId - The employee ID to remove
 * @returns {Object|null} The updated team or null if team not found
 */
export const removeEmployeeFromTeam = (teamId, employeeId) => {
	const team = getTeamById(teamId);
	if (!team) return null;

	// Check if trying to remove a position 1 employee
	const employeeToRemove = team.members.find((emp) => emp.id === employeeId);
	if (employeeToRemove && employeeToRemove.position === 1) {
		throw new Error('Cannot remove position 1 employee from team');
	}

	team.members = team.members.filter((member) => member.id !== employeeId);
	return team;
};

/**
 * Deletes a team
 * @param {string} teamId - The team ID to delete
 * @returns {boolean} True if team was deleted, false if not found
 */
export const deleteTeam = (teamId) => {
	const initialLength = teamsState.length;
	teamsState = teamsState.filter((team) => team.id !== teamId);
	return teamsState.length < initialLength;
};
