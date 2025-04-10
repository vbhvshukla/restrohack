import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	useNodesState,
	useEdgesState,
	addEdge,
	Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import employeesData from '../data/employees.json';
import { v4 as uuidv4 } from 'uuid';
import { createTeam, getTeams } from '../utils/teamUtils';
import { Link } from 'react-router-dom';

// Utility function to generate unique IDs for nodes
const generateNodeId = () => uuidv4().slice(0, 8);

// Create department nodes
const generateDepartmentNodes = () => {
	const departments = ['dev', 'sales', 'marketing'];
	return departments.map((dept, index) => ({
		id: dept,
		data: {
			label: dept.charAt(0).toUpperCase() + dept.slice(1),
			name: dept.charAt(0).toUpperCase() + dept.slice(1) + ' Department',
			email: `${dept}@company.com`,
			jobTitle: 'Department',
			department: dept,
		},
		position: { x: 500 * (index + 1), y: 150 },
		style: {
			background: '#f5f5f5',
			border: '1px solid #ddd',
			borderRadius: '5px',
			padding: '10px',
		},
	}));
};

// Process employee data to create nodes
const generateEmployeeNodes = (employeeData) => {
	const nodes = [];
	const departmentPositionMap = {};

	// Group employees by department and position
	employeeData.forEach((employee) => {
		const key = `${employee.department}-${employee.position}`;
		if (!departmentPositionMap[key]) {
			departmentPositionMap[key] = [];
		}
		departmentPositionMap[key].push(employee);
	});

	// Create nodes for each employee with proper positioning
	Object.keys(departmentPositionMap).forEach((key) => {
		const [department, positionStr] = key.split('-');
		const position = parseInt(positionStr);
		const employees = departmentPositionMap[key];

		// Calculate position based on department index and position level
		const deptIndex = ['dev', 'sales', 'marketing'].indexOf(department);
		const xBase = 500 * (deptIndex + 1);

		employees.forEach((employee, empIndex) => {
			// Spread employees horizontally within their position level
			const xOffset = (empIndex - (employees.length - 1) / 2) * 250;
			const nodeId = `${employee.department}-${
				employee.position
			}-${generateNodeId()}`;

			nodes.push({
				id: nodeId,
				data: {
					label: employee.name,
					name: employee.name,
					email: employee.email,
					jobTitle: `${
						employee.department.charAt(0).toUpperCase() +
						employee.department.slice(1)
					} - Position ${employee.position}`,
					department: employee.department,
					position: employee.position,
				},
				position: {
					x: xBase + xOffset,
					y: 150 + position * 200,
				},
				style: {
					background: '#ffffff',
					border: '1px solid #ccc',
					borderRadius: '5px',
					padding: '10px',
				},
			});
		});
	});

	return nodes;
};

// Create edges between nodes
const generateEdges = (adminId, departmentNodes, employeeNodes) => {
	const edges = [];
	const departments = ['dev', 'sales', 'marketing'];

	// Connect admin to departments
	departments.forEach((dept) => {
		edges.push({
			id: `e-admin-${dept}`,
			source: adminId,
			target: dept,
		});
	});

	// Group nodes by department and position
	const departmentPositionMap = {};
	employeeNodes.forEach((node) => {
		const dept = node.data.department;
		const position = node.data.position;
		if (!departmentPositionMap[dept]) {
			departmentPositionMap[dept] = {};
		}
		if (!departmentPositionMap[dept][position]) {
			departmentPositionMap[dept][position] = [];
		}
		departmentPositionMap[dept][position].push(node);
	});

	// Connect department to position 1
	departments.forEach((dept) => {
		if (departmentPositionMap[dept] && departmentPositionMap[dept][1]) {
			departmentPositionMap[dept][1].forEach((node) => {
				edges.push({
					id: `e-${dept}-${node.id}`,
					source: dept,
					target: node.id,
				});
			});
		}
	});

	// Connect positions hierarchically within departments
	// Assign each employee to a single parent (first available parent in previous position)
	departments.forEach((dept) => {
		if (departmentPositionMap[dept]) {
			for (let pos = 1; pos < 5; pos++) {
				if (
					departmentPositionMap[dept][pos] &&
					departmentPositionMap[dept][pos + 1]
				) {
					// For each position level, distribute children among parents
					const parents = departmentPositionMap[dept][pos];
					const children = departmentPositionMap[dept][pos + 1];

					// Distribute children evenly among parents
					children.forEach((childNode, index) => {
						// Determine parent index, distributing evenly
						const parentIndex = index % parents.length;
						const parentNode = parents[parentIndex];

						edges.push({
							id: `e-${parentNode.id}-${childNode.id}`,
							source: parentNode.id,
							target: childNode.id,
						});
					});
				}
			}
		}
	});

	return edges;
};

// Form for creating teams
const CreateTeamForm = ({ selectedEmployees, onSubmit, onCancel }) => {
	const [teamName, setTeamName] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();

		// Check if there's exactly one position 1 employee
		const position1Employees = selectedEmployees.filter(
			(emp) => emp.data.position === 1
		);

		if (position1Employees.length === 0) {
			setError('A team must have exactly one position 1 (department head)');
			return;
		}

		if (position1Employees.length > 1) {
			setError('A team cannot have more than one position 1 (department head)');
			return;
		}

		setError('');
		onSubmit(teamName);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white p-6 rounded-lg shadow-lg w-96"
		>
			<h3 className="text-xl font-semibold mb-4">Create New Team</h3>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Team Name
					</label>
					<input
						type="text"
						value={teamName}
						onChange={(e) => setTeamName(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<h4 className="text-md font-medium mb-2">
						Selected Employees ({selectedEmployees.length})
					</h4>
					<div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
						{selectedEmployees.map((employee) => (
							<div
								key={employee.id}
								className="flex items-center justify-between py-1"
							>
								<div>
									<span className="font-medium">{employee.data.name}</span>
									<span className="text-sm text-gray-500 ml-2">
										{employee.data.department} - Position{' '}
										{employee.data.position}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="mt-6 flex justify-end space-x-3">
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
				>
					Cancel
				</button>
				<button
					type="submit"
					className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
				>
					Create Team
				</button>
			</div>
		</form>
	);
};

const TeamCreation = () => {
	const [employees, setEmployees] = useState(employeesData);
	const [selectedEmployees, setSelectedEmployees] = useState([]);
	const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');

	// Create admin node
	const adminNode = {
		id: 'admin',
		type: 'input',
		data: {
			label: 'Admin',
			name: 'Admin',
			email: 'admin@company.com',
			jobTitle: 'Administrator',
		},
		position: { x: 750, y: 0 },
		style: {
			background: '#e6f7ff',
			border: '1px solid #91d5ff',
			borderRadius: '5px',
			padding: '10px',
		},
	};

	// Generate department and employee nodes
	const departmentNodes = generateDepartmentNodes();
	const employeeNodes = generateEmployeeNodes(employees);
	const allNodes = [adminNode, ...departmentNodes, ...employeeNodes];

	// Generate edges
	const allEdges = generateEdges(adminNode.id, departmentNodes, employeeNodes);

	const [nodes, setNodes, onNodesChange] = useNodesState(allNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(allEdges);

	// Update selected employee styling
	useEffect(() => {
		const updatedNodes = nodes.map((node) => {
			// Check if node is selected
			const isSelected = selectedEmployees.some(
				(selectedNode) => selectedNode.id === node.id
			);

			// Update node style based on selection status
			return {
				...node,
				style: {
					...node.style,
					background: isSelected
						? '#bae7ff'
						: node.id === 'admin'
						? '#e6f7ff'
						: node.type === 'input'
						? '#f5f5f5'
						: '#ffffff',
					border: isSelected ? '2px solid #1890ff' : '1px solid #ccc',
					boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.5)' : 'none',
				},
			};
		});

		setNodes(updatedNodes);
	}, [selectedEmployees]);

	const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	const onNodeClick = useCallback((event, node) => {
		// Don't select admin or department nodes
		if (
			node.id === 'admin' ||
			['dev', 'sales', 'marketing'].includes(node.id)
		) {
			return;
		}

		setSelectedEmployees((prev) => {
			// Check if node is already selected
			const isAlreadySelected = prev.some(
				(selectedNode) => selectedNode.id === node.id
			);

			if (isAlreadySelected) {
				// Remove from selection
				return prev.filter((selectedNode) => selectedNode.id !== node.id);
			} else {
				// Add to selection
				return [...prev, node];
			}
		});
	}, []);

	const handleCreateTeam = (teamName) => {
		try {
			// Convert selected employees to the format expected by createTeam
			const employeeData = selectedEmployees.map((node) => ({
				id: node.id,
				name: node.data.name,
				email: node.data.email,
				department: node.data.department,
				position: node.data.position,
			}));

			// Create the team
			const newTeam = createTeam(teamName, employeeData);

			// Clear selection and show success message
			setSelectedEmployees([]);
			setShowCreateTeamForm(false);
			setSuccessMessage(`Team "${newTeam.name}" created successfully!`);

			// Clear success message after 3 seconds
			setTimeout(() => {
				setSuccessMessage('');
			}, 3000);
		} catch (error) {
			console.error('Error creating team:', error);
			// The form will handle validation errors
		}
	};

	return (
		<div className="w-full h-[1000px] relative">
			<div className="absolute top-5 left-5 z-50 flex space-x-4">
				<Link
					to="/"
					className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
				>
					Back to Organization
				</Link>
				<Link
					to="/teams/view"
					className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
				>
					View Teams
				</Link>
			</div>

			{successMessage && (
				<div className="fixed top-5 right-5 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
					{successMessage}
				</div>
			)}

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onNodeClick={onNodeClick}
				defaultZoom={0.6}
				minZoom={0.1}
				maxZoom={1.5}
				fitView
			>
				<Background />
				<Controls />
				<MiniMap />
				<Panel position="top-right" className="space-y-2">
					<div className="bg-white p-3 rounded-md shadow-md">
						<p className="text-sm mb-2">
							<span className="font-medium">Selected:</span>{' '}
							{selectedEmployees.length} employees
						</p>
						<button
							onClick={() => setShowCreateTeamForm(true)}
							disabled={selectedEmployees.length === 0}
							className={`px-4 py-2 rounded-md w-full ${
								selectedEmployees.length === 0
									? 'bg-gray-300 text-gray-500 cursor-not-allowed'
									: 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
							}`}
						>
							Create Team
						</button>
					</div>
					<div className="bg-white p-3 rounded-md shadow-md">
						<button
							onClick={() => setSelectedEmployees([])}
							disabled={selectedEmployees.length === 0}
							className={`px-4 py-2 rounded-md w-full ${
								selectedEmployees.length === 0
									? 'bg-gray-300 text-gray-500 cursor-not-allowed'
									: 'bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500'
							}`}
						>
							Clear Selection
						</button>
					</div>
				</Panel>
			</ReactFlow>

			{showCreateTeamForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<CreateTeamForm
						selectedEmployees={selectedEmployees}
						onSubmit={handleCreateTeam}
						onCancel={() => setShowCreateTeamForm(false)}
					/>
				</div>
			)}
		</div>
	);
};

export default TeamCreation;
