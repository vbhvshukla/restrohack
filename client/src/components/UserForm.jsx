import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        teamId: '',
        positionId: ''
    });

    const [teams, setTeams] = useState([]);
    const [positions, setPositions] = useState([]);
    const [formState, setFormState] = useState('idle'); // idle, loading, success, error
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch teams and positions from backend
    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoadingOptions(true);
            try {
                // Fetch teams
                const teamsResponse = await axios.get('http://localhost:8006/api/v1/team/');
                if (teamsResponse.data.success) {
                    console.log(teamsResponse.data);
                    setTeams(teamsResponse.data.data);
                }
                
                // Fetch positions
                const positionsResponse = await axios.get('http://localhost:8006/api/v1/position/');
                if (positionsResponse.data.success) {
                    console.log(positionsResponse.data);
                    
                    // Process the nested position structure
                    const allPositions = [];
                    
                    // Flatten the nested structure
                    positionsResponse.data.data.forEach(levelGroup => {
                        if (levelGroup.positions && Array.isArray(levelGroup.positions)) {
                            levelGroup.positions.forEach(position => {
                                // Add the level from the parent object if not already in the position
                                if (!position.level && levelGroup.level) {
                                    position.level = levelGroup.level;
                                }
                                allPositions.push(position);
                            });
                        }
                    });
                    
                    setPositions(allPositions);
                }
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormState('loading');
        setErrorMessage('');
        
        // Form validation
        if (!formData.name || !formData.email || !formData.password) {
            setFormState('error');
            setErrorMessage('Name, email, and password are required');
            return;
        }

        // Password confirmation check
        if (formData.password !== formData.confirmPassword) {
            setFormState('error');
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            // Create payload for user creation
            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role: formData.role
            };
            
            // Add optional fields if provided
            if (formData.teamId) {
                userData.teamId = formData.teamId;
            }
            
            if (formData.positionId) {
                userData.positionId = formData.positionId;
            }
            
            console.log('Sending user data:', userData);
            
            // Send request to create user
            const response = await axios.post('http://localhost:8006/api/v1/user/', userData);
            
            console.log('User created:', response.data);
            
            if (response.data.success) {
                setFormState('success');
                
                // Reset form after success
                setTimeout(() => {
                    setFormState('idle');
                    setFormData({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        role: 'user',
                        teamId: '',
                        positionId: ''
                    });
                    // Redirect to users page
                    navigate('/');
                }, 2000);
            } else {
                setFormState('error');
                setErrorMessage(response.data.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setFormState('error');
            
            if (error.response?.status === 400 && error.response?.data?.message) {
                // This might be email already exists
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage(
                    error.response?.data?.message || 
                    'Failed to create user. Please try again.'
                );
            }
        }
    };

    const containerVariants = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const roleOptions = [
        { id: 'user', label: 'User' },
        { id: 'admin', label: 'Admin' },
        { id: 'team_lead', label: 'Team Lead' },
        { id: 'department_head', label: 'Department Head' }
    ];
    
    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Material UI inspired card */}
                <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 bg-teal-600">
                        <h1 className="text-xl font-medium text-white">Add User</h1>
                        <p className="text-teal-50 text-sm mt-1">
                            Create a new user account for your organization
                        </p>
                    </div>
                    
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-5">
                            {/* Basic Information Section */}
                            <div className="border-b border-gray-700 pb-5">
                                <h2 className="text-lg font-medium text-white mb-4">Basic Information</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g., John Doe"
                                                className={`block w-full px-4 py-3 rounded-md bg-gray-700 border ${
                                                    formState === 'error' && !formData.name 
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                        : 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                                                } shadow-sm placeholder-gray-400 text-white text-sm transition-colors`}
                                            />
                                            {formState === 'error' && !formData.name && (
                                                <p className="mt-1 text-sm text-red-400">Name is required</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="e.g., john@example.com"
                                                className={`block w-full px-4 py-3 rounded-md bg-gray-700 border ${
                                                    formState === 'error' && !formData.email 
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                        : 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                                                } shadow-sm placeholder-gray-400 text-white text-sm transition-colors`}
                                            />
                                            {formState === 'error' && !formData.email && (
                                                <p className="mt-1 text-sm text-red-400">Email is required</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="border-b border-gray-700 pb-5">
                                <h2 className="text-lg font-medium text-white mb-4">Security</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Password */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                            Password
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className={`block w-full px-4 py-3 rounded-md bg-gray-700 border ${
                                                    formState === 'error' && !formData.password 
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                        : 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                                                } shadow-sm placeholder-gray-400 text-white text-sm transition-colors`}
                                            />
                                            {formState === 'error' && !formData.password && (
                                                <p className="mt-1 text-sm text-red-400">Password is required</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className={`block w-full px-4 py-3 rounded-md bg-gray-700 border ${
                                                    formState === 'error' && (formData.password !== formData.confirmPassword)
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                        : 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                                                } shadow-sm placeholder-gray-400 text-white text-sm transition-colors`}
                                            />
                                            {formState === 'error' && formData.password && (formData.password !== formData.confirmPassword) && (
                                                <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role Section */}
                            <div className="border-b border-gray-700 pb-5">
                                <h2 className="text-lg font-medium text-white mb-4">Role & Permissions</h2>
                                
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                                        User Role
                                    </label>
                                    <div className="relative mt-1">
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500 shadow-sm placeholder-gray-400 text-white text-sm transition-colors"
                                        >
                                            {roleOptions.map(option => (
                                                <option key={option.id} value={option.id}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Team Assignment Section */}
                            <div>
                                <h2 className="text-lg font-medium text-white mb-4">Team Assignment</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Team */}
                                    <div>
                                        <label htmlFor="teamId" className="block text-sm font-medium text-gray-300 mb-1">
                                            Team
                                        </label>
                                        <div className="relative mt-1">
                                            <select
                                                id="teamId"
                                                name="teamId"
                                                value={formData.teamId}
                                                onChange={handleChange}
                                                disabled={isLoadingOptions}
                                                className={`block w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500 shadow-sm placeholder-gray-400 text-white text-sm transition-colors ${
                                                    isLoadingOptions ? 'cursor-wait' : ''
                                                }`}
                                            >
                                                <option key="default-team" value="">
                                                    {isLoadingOptions ? 'Loading teams...' : '-- Select a team --'}
                                                </option>
                                                {teams.map(team => (
                                                    <option key={team._id} value={team._id}>
                                                        {team.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Position */}
                                    <div>
                                        <label htmlFor="positionId" className="block text-sm font-medium text-gray-300 mb-1">
                                            Position
                                        </label>
                                        <div className="relative mt-1">
                                            <select
                                                id="positionId"
                                                name="positionId"
                                                value={formData.positionId}
                                                onChange={handleChange}
                                                disabled={isLoadingOptions}
                                                className={`block w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500 shadow-sm placeholder-gray-400 text-white text-sm transition-colors ${
                                                    isLoadingOptions ? 'cursor-wait' : ''
                                                }`}
                                            >
                                                <option key="default-position" value="">
                                                    {isLoadingOptions ? 'Loading positions...' : '-- Select a position --'}
                                                </option>
                                                {positions && positions.length > 0 ? positions.map(position => (
                                                    <option key={position._id} value={position._id}>
                                                        {position.name} {position.level ? `(Level ${position.level})` : ''}
                                                    </option>
                                                )) : null}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Error Message Display */}
                            {formState === 'error' && errorMessage && (
                                <div className="p-4 bg-red-900/50 rounded-md border border-red-700">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-300">{errorMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Action buttons */}
                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formState === 'loading' || isLoadingOptions}
                                    className={`px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 ${
                                        (formState === 'loading' || isLoadingOptions) ? 'opacity-70 cursor-wait' : ''
                                    }`}
                                >
                                    {formState === 'loading' ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing
                                        </span>
                                    ) : formState === 'success' ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Created
                                        </span>
                                    ) : "Create User"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                
                {/* Material UI inspired elevation shadow effect */}
                <div className="h-2 bg-teal-600 w-full max-w-lg mx-auto rounded-b-lg opacity-50 -mt-1 shadow-md"></div>
                <div className="h-1 bg-teal-600 w-[98%] max-w-[calc(100%-8px)] mx-auto rounded-b-lg opacity-30 -mt-1 shadow-md"></div>
            </motion.div>
        </div>
    );
};

export default UserForm; 