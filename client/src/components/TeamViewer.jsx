import React, { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { getTeams, getTeamById } from '../utils/teamUtils';
import { v4 as uuidv4 } from 'uuid';

// Utility function to generate nodes for a team
const generateTeamNodes = (team) => {
	if (!team || !team.members || team.members.length === 0) {
		return [];
	}

	// Find the position 1 employee (department head)
	const departmentHead = team.members.find((member) => member.position === 1);

	if (!departmentHead) {
		return [];
	}

	const nodes = [];

	// Create department head node
	nodes.push({
		id: departmentHead.id,
		type: 'input',
		data: {
			label: departmentHead.name,
			name: departmentHead.name,
			email: departmentHead.email,
			jobTitle: `${
				departmentHead.department.charAt(0).toUpperCase() +
				departmentHead.department.slice(1)
			} - Position ${departmentHead.position}`,
			department: departmentHead.department,
			position: departmentHead.position,
		},
		position: { x: 400, y: 0 },
		style: {
			background: '#e6f7ff',
			border: '1px solid #91d5ff',
			borderRadius: '5px',
			padding: '10px',
		},
	});

	// Group other employees by position
	const positionGroups = {};
	team.members.forEach((member) => {
		if (member.position === 1) return; // Skip department head

		if (!positionGroups[member.position]) {
			positionGroups[member.position] = [];
		}
		positionGroups[member.position].push(member);
	});

	// Create nodes for employees by position
	Object.keys(positionGroups).forEach((position) => {
		const positionLevel = parseInt(position);
		const employees = positionGroups[position];

		employees.forEach((employee, index) => {
			// Spread employees horizontally based on their index
			const totalEmployees = employees.length;
			const xOffset = (index - (totalEmployees - 1) / 2) * 250;

			nodes.push({
				id: employee.id,
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
					x: 400 + xOffset,
					y: positionLevel * 150,
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

// Utility function to generate edges for a team
const generateTeamEdges = (team, nodes) => {
	if (
		!team ||
		!team.members ||
		team.members.length === 0 ||
		!nodes ||
		nodes.length === 0
	) {
		return [];
	}

	const edges = [];

	// Find the position 1 employee (department head)
	const departmentHead = team.members.find((member) => member.position === 1);

	if (!departmentHead) {
		return [];
	}

	// Group employees by position
	const positionNodeMap = {};
	nodes.forEach((node) => {
		const position = node.data.position;
		if (!positionNodeMap[position]) {
			positionNodeMap[position] = [];
		}
		positionNodeMap[position].push(node);
	});

	// Connect department head to position 2 employees
	if (positionNodeMap[2]) {
		positionNodeMap[2].forEach((node) => {
			edges.push({
				id: `e-${departmentHead.id}-${node.id}`,
				source: departmentHead.id,
				target: node.id,
			});
		});
	}

	// Connect remaining positions hierarchically
	for (let pos = 2; pos < 5; pos++) {
		if (positionNodeMap[pos] && positionNodeMap[pos + 1]) {
			// Distribute children evenly among parents
			const parents = positionNodeMap[pos];
			const children = positionNodeMap[pos + 1];

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

	return edges;
};

// Node details component
const NodeDetails = ({ node }) => {
	if (!node) return null;

	return (
		<div className="space-y-2">
			<h3 className="text-lg font-semibold">Employee Details</h3>
			<p>
				<span className="font-medium">Name:</span> {node.data.name}
			</p>
			<p>
				<span className="font-medium">Email:</span> {node.data.email}
			</p>
			<p>
				<span className="font-medium">Job Title:</span> {node.data.jobTitle}
			</p>
			<p>
				<span className="font-medium">Department:</span> {node.data.department}
			</p>
			<p>
				<span className="font-medium">Position:</span> {node.data.position}
			</p>
		</div>
	);
};

const TeamViewer = () => {
	const [teams, setTeams] = useState(getTeams());
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [selectedNode, setSelectedNode] = useState(null);

	// Generate nodes and edges based on selected team
	const teamNodes = selectedTeam ? generateTeamNodes(selectedTeam) : [];
	const teamEdges = selectedTeam
		? generateTeamEdges(selectedTeam, teamNodes)
		: [];

	const [nodes, setNodes, onNodesChange] = useNodesState(teamNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(teamEdges);

	// Update nodes and edges when selected team changes
	useEffect(() => {
		if (selectedTeam) {
			const teamNodes = generateTeamNodes(selectedTeam);
			const teamEdges = generateTeamEdges(selectedTeam, teamNodes);
			setNodes(teamNodes);
			setEdges(teamEdges);
		} else {
			setNodes([]);
			setEdges([]);
		}
	}, [selectedTeam, setNodes, setEdges]);

	const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	const onNodeClick = useCallback((event, node) => {
		setSelectedNode(node);
	}, []);

	// Handle team selection
	const handleTeamSelect = (teamId) => {
		const team = getTeamById(teamId);
		setSelectedTeam(team);
		setSelectedNode(null);
	};

	return (
		<div className="flex h-[1000px]">
			{/* Team selection sidebar */}
			<div className="w-64 bg-gray-100 p-4 border-r border-gray-300 overflow-y-auto">
				<div className="flex space-x-2 mb-6">
					<Link
						to="/"
						className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
					>
						Organization
					</Link>
					<Link
						to="/teams/create"
						className="px-3 py-1 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
					>
						Create Teams
					</Link>
				</div>

				<h2 className="text-xl font-semibold mb-4">Teams</h2>

				{teams.length === 0 ? (
					<p className="text-gray-500">No teams created yet</p>
				) : (
					<ul className="space-y-2">
						{teams.map((team) => (
							<li key={team.id}>
								<button
									onClick={() => handleTeamSelect(team.id)}
									className={`w-full text-left p-3 rounded-md ${
										selectedTeam && selectedTeam.id === team.id
											? 'bg-blue-500 text-white'
											: 'bg-white hover:bg-gray-200'
									}`}
								>
									<div className="font-medium">{team.name}</div>
									<div className="text-sm mt-1">
										{selectedTeam && selectedTeam.id === team.id ? (
											<span className="text-blue-100">
												{team.members.length} members
											</span>
										) : (
											<span className="text-gray-500">
												{team.members.length} members
											</span>
										)}
									</div>
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			{/* React Flow container */}
			<div className="flex-1 relative">
				{selectedTeam ? (
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onNodeClick={onNodeClick}
						defaultZoom={0.8}
						minZoom={0.2}
						maxZoom={1.5}
						fitView
					>
						<Background />
						<Controls />
						<MiniMap />
						<Panel position="top-left">
							<div className="bg-white p-3 rounded-md shadow-md">
								<h3 className="text-lg font-semibold">{selectedTeam.name}</h3>
								<p className="text-sm text-gray-600">
									{selectedTeam.members.length} members
								</p>
							</div>
						</Panel>
					</ReactFlow>
				) : (
					<div className="h-full flex items-center justify-center">
						<div className="text-center">
							<p className="text-xl text-gray-500">
								Select a team to view its organization structure
							</p>
						</div>
					</div>
				)}

				{/* Node details panel */}
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
		</div>
	);
};

export default TeamViewer;
