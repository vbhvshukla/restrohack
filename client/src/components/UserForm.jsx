import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const UserForm = () => {
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

    // Simulate fetching teams and positions
    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoadingOptions(true);
            try {
                // In a real app, this would be API calls
                // Simulating API call with timeout
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Mock data
                setTeams([
                    { _id: '1', name: 'Frontend Team' },
                    { _id: '2', name: 'Backend Team' },
                    { _id: '3', name: 'DevOps Team' },
                    { _id: '4', name: 'Design Team' }
                ]);
                
                setPositions([
                    { _id: '1', name: 'Software Engineer', level: 3 },
                    { _id: '2', name: 'Senior Developer', level: 4 },
                    { _id: '3', name: 'Project Manager', level: 5 },
                    { _id: '4', name: 'UI/UX Designer', level: 3 }
                ]);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormState('loading');
        
        // Form validation
        if (!formData.name || !formData.email || !formData.password) {
            setFormState('error');
            return;
        }

        // Password confirmation check
        if (formData.password !== formData.confirmPassword) {
            setFormState('error');
            return;
        }

        // Simulate API call
        setTimeout(() => {
            console.log(formData);
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
            }, 2000);
        }, 1500);
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

                            {/* Role & Assignment Section */}
                            <div>
                                <h2 className="text-lg font-medium text-white mb-4">Role & Assignment</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Role */}
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
                                                className="block w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500 shadow-sm text-white text-sm transition-colors"
                                            >
                                                {roleOptions.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
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
                                                className={`block w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500 shadow-sm text-white text-sm transition-colors ${
                                                    isLoadingOptions ? 'cursor-wait' : ''
                                                }`}
                                            >
                                                <option value="">Select a team (optional)</option>
                                                {teams.map(team => (
                                                    <option key={team._id} value={team._id}>
                                                        {team.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Position */}
                                    <div className="md:col-span-2">
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
                                                className={`block w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500 shadow-sm text-white text-sm transition-colors ${
                                                    isLoadingOptions ? 'cursor-wait' : ''
                                                }`}
                                            >
                                                <option value="">Select a position (optional)</option>
                                                {positions.map(position => (
                                                    <option key={position._id} value={position._id}>
                                                        {position.name} - Level {position.level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Info box */}
                            <div className="mt-4 p-4 bg-gray-700 rounded-md border border-gray-600">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-300">
                                            Users can be assigned to teams and positions based on their role in the organization. 
                                            Different roles provide different levels of access to the system.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
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