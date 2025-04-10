import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TeamForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        departmentId: ''
    });

    const [departments, setDepartments] = useState([]);
    const [formState, setFormState] = useState('idle'); // idle, loading, success, error
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

    // Simulate fetching departments
    useEffect(() => {
        const fetchDepartments = async () => {
            setIsLoadingDepartments(true);
            try {
                // In a real app, this would be an API call
                // Simulating API call with timeout
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Mock data
                setDepartments([
                    { _id: '1', name: 'Engineering' },
                    { _id: '2', name: 'Marketing' },
                    { _id: '3', name: 'Human Resources' },
                    { _id: '4', name: 'Finance' },
                    { _id: '5', name: 'Operations' }
                ]);
            } catch (error) {
                console.error('Error fetching departments:', error);
            } finally {
                setIsLoadingDepartments(false);
            }
        };

        fetchDepartments();
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
        if (!formData.name || !formData.departmentId) {
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
                    departmentId: ''
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

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Material UI inspired card */}
                <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 bg-teal-600">
                        <h1 className="text-xl font-medium text-white">Add Team</h1>
                        <p className="text-teal-50 text-sm mt-1">
                            Create a new team for your organization
                        </p>
                    </div>
                    
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-5">
                            {/* Team Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                    Team Name
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Frontend Development"
                                        className={`block w-full px-4 py-3 rounded-md bg-gray-700 border ${
                                            formState === 'error' && !formData.name 
                                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                                        } shadow-sm placeholder-gray-400 text-white text-sm transition-colors`}
                                    />
                                    {formState === 'error' && !formData.name && (
                                        <p className="mt-1 text-sm text-red-400">Team name is required</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Department Selection */}
                            <div>
                                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-300 mb-1">
                                    Department
                                </label>
                                <div className="relative mt-1">
                                    <select
                                        id="departmentId"
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        disabled={isLoadingDepartments}
                                        className={`block w-full px-4 py-3 rounded-md bg-gray-700 border ${
                                            formState === 'error' && !formData.departmentId 
                                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                                        } shadow-sm placeholder-gray-400 text-white text-sm transition-colors ${
                                            isLoadingDepartments ? 'cursor-wait' : ''
                                        }`}
                                    >
                                        <option value="" disabled>
                                            {isLoadingDepartments ? 'Loading departments...' : 'Select a department'}
                                        </option>
                                        {departments.map(department => (
                                            <option key={department._id} value={department._id}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formState === 'error' && !formData.departmentId && (
                                        <p className="mt-1 text-sm text-red-400">Department is required</p>
                                    )}
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
                                            Teams belong to departments and help organize employees into functional groups. Each team must be associated with a department.
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
                                    disabled={formState === 'loading' || isLoadingDepartments}
                                    className={`px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 ${
                                        (formState === 'loading' || isLoadingDepartments) ? 'opacity-70 cursor-wait' : ''
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
                                    ) : "Create Team"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                
                {/* Material UI inspired elevation shadow effect */}
                <div className="h-2 bg-teal-600 w-full max-w-md mx-auto rounded-b-lg opacity-50 -mt-1 shadow-md"></div>
                <div className="h-1 bg-teal-600 w-[98%] max-w-[calc(100%-8px)] mx-auto rounded-b-lg opacity-30 -mt-1 shadow-md"></div>
            </motion.div>
        </div>
    );
};

export default TeamForm; 