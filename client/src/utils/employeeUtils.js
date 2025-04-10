import employeesData from '../data/employees.json';

/**
 * Gets all employees from the data source
 * @returns {Array} Array of employee objects
 */
export const getEmployees = () => {
	return employeesData;
};

/**
 * Adds a new employee to the data
 * @param {Object} employee - The employee object to add
 * @param {string} employee.name - Employee name
 * @param {string} employee.email - Employee email
 * @param {string} employee.department - Employee department (dev, sales, marketing)
 * @param {number} employee.position - Employee position (1-5)
 * @returns {Array} Updated array of employees
 */
export const addEmployee = (employee) => {
	// In a real application, this would make an API call
	// For this demo, we'll just return a new array with the added employee
	return [...employeesData, employee];
};

/**
 * Groups employees by department and position
 * @param {Array} employees - Array of employee objects
 * @returns {Object} Grouped employees object
 */
export const groupEmployeesByDepartmentAndPosition = (employees) => {
	const grouped = {};

	employees.forEach((employee) => {
		const { department, position } = employee;

		if (!grouped[department]) {
			grouped[department] = {};
		}

		if (!grouped[department][position]) {
			grouped[department][position] = [];
		}

		grouped[department][position].push(employee);
	});

	return grouped;
};

/**
 * Gets employees by department
 * @param {Array} employees - Array of employee objects
 * @param {string} department - Department name
 * @returns {Array} Employees in the specified department
 */
export const getEmployeesByDepartment = (employees, department) => {
	return employees.filter((employee) => employee.department === department);
};

/**
 * Gets employees by position
 * @param {Array} employees - Array of employee objects
 * @param {number} position - Position number
 * @returns {Array} Employees at the specified position
 */
export const getEmployeesByPosition = (employees, position) => {
	return employees.filter((employee) => employee.position === position);
};
