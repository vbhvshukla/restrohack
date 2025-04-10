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
import { getEmployees, addEmployee } from '../utils/employeeUtils';
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

const NodeDetails = ({ node }) => {
	if (!node) return null;

	return (
		<div className="space-y-2">
			<h3 className="text-lg font-semibold">Node Details</h3>
			<p>
				<span className="font-medium">Name:</span> {node.data.name}
			</p>
			<p>
				<span className="font-medium">Email:</span> {node.data.email}
			</p>
			<p>
				<span className="font-medium">Job Title:</span> {node.data.jobTitle}
			</p>
			{node.data.department && (
				<p>
					<span className="font-medium">Department:</span>{' '}
					{node.data.department}
				</p>
			)}
			{node.data.position && (
				<p>
					<span className="font-medium">Position:</span> {node.data.position}
				</p>
			)}
		</div>
	);
};

const AddEmployeeForm = ({ onSubmit, onCancel }) => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		department: 'dev',
		position: 1,
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white p-6 rounded-lg shadow-lg w-96"
		>
			<h3 className="text-xl font-semibold mb-4">Add New Employee</h3>
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Name
					</label>
					<input
						type="text"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Email
					</label>
					<input
						type="email"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Department
					</label>
					<select
						value={formData.department}
						onChange={(e) =>
							setFormData({ ...formData, department: e.target.value })
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					>
						<option value="dev">Development</option>
						<option value="sales">Sales</option>
						<option value="marketing">Marketing</option>
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Position (1-5)
					</label>
					<select
						value={formData.position}
						onChange={(e) =>
							setFormData({ ...formData, position: parseInt(e.target.value) })
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					>
						{[1, 2, 3, 4, 5].map((pos) => (
							<option key={pos} value={pos}>
								{pos}
							</option>
						))}
					</select>
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
					Add Employee
				</button>
			</div>
		</form>
	);
};

const OrganizationStructure = () => {
	const [employees, setEmployees] = useState(employeesData);
	const [selectedNode, setSelectedNode] = useState(null);
	const [showAddForm, setShowAddForm] = useState(false);

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
	};

	// Generate department and employee nodes
	const departmentNodes = generateDepartmentNodes();
	const employeeNodes = generateEmployeeNodes(employees);
	const allNodes = [adminNode, ...departmentNodes, ...employeeNodes];

	// Generate edges
	const allEdges = generateEdges(adminNode.id, departmentNodes, employeeNodes);

	const [nodes, setNodes, onNodesChange] = useNodesState(allNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(allEdges);

	// Update nodes and edges when employees change
	useEffect(() => {
		const departmentNodes = generateDepartmentNodes();
		const employeeNodes = generateEmployeeNodes(employees);
		const allNodes = [adminNode, ...departmentNodes, ...employeeNodes];
		const allEdges = generateEdges(
			adminNode.id,
			departmentNodes,
			employeeNodes
		);

		setNodes(allNodes);
		setEdges(allEdges);
	}, [employees]);

	const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	const onNodeClick = useCallback((event, node) => {
		setSelectedNode(node);
	}, []);

	const handleAddEmployee = (formData) => {
		const newEmployee = {
			department: formData.department,
			position: formData.position,
			name: formData.name,
			email: formData.email,
		};

		// Use the utility function to add an employee
		const updatedEmployees = addEmployee(newEmployee);
		setEmployees(updatedEmployees);
		setShowAddForm(false);
	};

	return (
		<div className="w-full h-[1000px] relative">
			<div className="absolute top-5 left-5 z-50 flex space-x-4">
				<Link
					to="/teams/create"
					className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
				>
					Create Teams
				</Link>
				<Link
					to="/teams/view"
					className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
				>
					View Teams
				</Link>
			</div>

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
				<Panel position="top-right">
					<button
						onClick={() => setShowAddForm(true)}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						Add Employee
					</button>
				</Panel>
			</ReactFlow>

			{showAddForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<AddEmployeeForm
						onSubmit={handleAddEmployee}
						onCancel={() => setShowAddForm(false)}
					/>
				</div>
			)}

			{selectedNode && (
				<div className="fixed top-5 right-5 bg-white p-6 rounded-lg shadow-lg z-50 max-w-xs">
					<NodeDetails node={selectedNode} />
					<div className="mt-4">
						<button
							onClick={() => setSelectedNode(null)}
							className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrganizationStructure;
