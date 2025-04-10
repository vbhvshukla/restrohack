import React, { useCallback, useState } from 'react';
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	useNodesState,
	useEdgesState,
	addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import employeesData from '../data/employees.json';
import { v4 as uuidv4 } from 'uuid';

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
			background: '#1f2937',
			border: '1px solid #374151',
			borderRadius: '8px',
			padding: '15px',
			color: '#f3f4f6',
			boxShadow:
				'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
					background: '#1f2937',
					border: '1px solid #374151',
					borderRadius: '8px',
					padding: '15px',
					color: '#f3f4f6',
					boxShadow:
						'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
			style: { stroke: '#0d9488', strokeWidth: 2 },
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
					style: { stroke: '#0d9488', strokeWidth: 2 },
				});
			});
		}
	});

	// Connect positions hierarchically within departments
	departments.forEach((dept) => {
		if (departmentPositionMap[dept]) {
			for (let pos = 1; pos < 5; pos++) {
				if (
					departmentPositionMap[dept][pos] &&
					departmentPositionMap[dept][pos + 1]
				) {
					const parents = departmentPositionMap[dept][pos];
					const children = departmentPositionMap[dept][pos + 1];

					children.forEach((childNode, index) => {
						const parentIndex = index % parents.length;
						const parentNode = parents[parentIndex];

						edges.push({
							id: `e-${parentNode.id}-${childNode.id}`,
							source: parentNode.id,
							target: childNode.id,
							style: { stroke: '#0d9488', strokeWidth: 2 },
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
		<div className="space-y-2 bg-gray-800 p-6 rounded-lg shadow-lg">
			<h3 className="text-lg font-semibold text-white">Node Details</h3>
			<p className="text-gray-300">
				<span className="font-medium text-teal-400">Name:</span>{' '}
				{node.data.name}
			</p>
			<p className="text-gray-300">
				<span className="font-medium text-teal-400">Email:</span>{' '}
				{node.data.email}
			</p>
			<p className="text-gray-300">
				<span className="font-medium text-teal-400">Job Title:</span>{' '}
				{node.data.jobTitle}
			</p>
			{node.data.department && (
				<p className="text-gray-300">
					<span className="font-medium text-teal-400">Department:</span>{' '}
					{node.data.department}
				</p>
			)}
			{node.data.position && (
				<p className="text-gray-300">
					<span className="font-medium text-teal-400">Position:</span>{' '}
					{node.data.position}
				</p>
			)}
		</div>
	);
};

const OrganizationStructure = () => {
	const [selectedNode, setSelectedNode] = useState(null);

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
			background: '#0d9488',
			border: '1px solid #0f766e',
			borderRadius: '8px',
			padding: '15px',
			color: '#ffffff',
			boxShadow:
				'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		},
	};

	// Generate department and employee nodes
	const departmentNodes = generateDepartmentNodes();
	const employeeNodes = generateEmployeeNodes(employeesData);
	const allNodes = [adminNode, ...departmentNodes, ...employeeNodes];

	// Generate edges
	const allEdges = generateEdges(adminNode.id, departmentNodes, employeeNodes);

	const [nodes, setNodes, onNodesChange] = useNodesState(allNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(allEdges);

	const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	const onNodeClick = useCallback((event, node) => {
		setSelectedNode(node);
	}, []);

	return (
		<div className="w-full h-[1000px] relative bg-gray-900">
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
				<Background color="#374151" gap={16} />
				<Controls className="bg-gray-800 rounded-lg shadow-lg" />
				<MiniMap
					className="bg-gray-800 rounded-lg shadow-lg"
					nodeColor="#0d9488"
					maskColor="rgba(17, 24, 39, 0.5)"
				/>
			</ReactFlow>

			{selectedNode && (
				<div className="fixed top-5 right-5 z-50 max-w-xs">
					<NodeDetails node={selectedNode} />
					<div className="mt-4">
						<button
							onClick={() => setSelectedNode(null)}
							className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
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
