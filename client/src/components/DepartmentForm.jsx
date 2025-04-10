import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DepartmentForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    const [formState, setFormState] = useState('idle'); 
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormState('loading');
        setErrorMessage('');
        
        // Form validation
        if (!formData.name) {
            setFormState('error');
            setErrorMessage('Department name is required');
            return;
        }

        try {
            // Send data to backend using the correct API endpoint
            const response = await axios.post('http://localhost:8006/api/v1/department/', {
                name: formData.name.trim(),
                description: formData.description.trim(),
                isActive: formData.isActive
            });
            
            console.log('Department created:', response.data);
            
            if (response.data.success) {
                setFormState('success');
                
                // Reset form after success
                setTimeout(() => {
                    setFormState('idle');
                    setFormData({
                        name: '',
                        description: '',
                        isActive: true
                    });
                    // Redirect to organization structure page
                    navigate('/');
                }, 2000);
            } else {
                // Handle potential server-side validation errors
                setFormState('error');
                setErrorMessage(response.data.message || 'Failed to create department.');
            }
        } catch (error) {
            console.error('Error creating department:', error);
            setFormState('error');
            
            // Handle specific backend error responses
            if (error.response?.status === 400 && error.response?.data?.message) {
                // This covers the "Department with this name already exists" case
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage(
                    error.response?.data?.message || 
                    'Failed to create department. Please try again.'
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
                        <h1 className="text-xl font-medium text-white">Add Department</h1>
                        <p className="text-teal-50 text-sm mt-1">
                            Create a new department for your organization
                        </p>
                    </div>
                    
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-5">
                            {/* Department Information Section */}
                            <div className="border-b border-gray-700 pb-5">
                                <h2 className="text-lg font-medium text-white mb-4">Department Information</h2>
                                
                                <div className="space-y-5">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                            Department Name
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g., Engineering"
                                                className={`block w-full px-4 py-3 rounded-md bg-gray-700 border ${
                                                    formState === 'error' && !formData.name 
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                        : 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                                                } shadow-sm placeholder-gray-400 text-white text-sm transition-colors`}
                                            />
                                            {formState === 'error' && !formData.name && (
                                                <p className="mt-1 text-sm text-red-400">Department name is required</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <div className="relative mt-1">
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Describe the department's purpose and responsibilities"
                                                rows={4}
                                                className="block w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500 shadow-sm placeholder-gray-400 text-white text-sm transition-colors resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Department Status Section */}
                            <div>
                                <h2 className="text-lg font-medium text-white mb-4">Department Status</h2>
                                
                                <div>
                                    {/* Status */}
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            className="h-5 w-5 text-teal-600 rounded border-gray-500 focus:ring-teal-500 bg-gray-700"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                                            Active Department
                                        </label>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-400 ml-8">
                                        Active departments are visible throughout the system and can have teams assigned to them.
                                    </p>
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
                                            Departments are top-level organizational units that contain teams. 
                                            Each department should have a clear and distinct purpose within your organization.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
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
                                    disabled={formState === 'loading'}
                                    className={`px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 ${
                                        formState === 'loading' ? 'opacity-70 cursor-wait' : ''
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
                                    ) : "Create Department"}
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

export default DepartmentForm; 