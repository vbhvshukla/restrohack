import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const Login = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		
		try {
			// Send login request to the backend
			const response = await axios.post('http://localhost:8006/api/v1/auth/login', {
				email: formData.email.trim(),
				password: formData.password
			}, {
				withCredentials: true // Important for cookies
			});
			
			console.log('Login response:', response.data);
			
			// Check if login was successful
			if (response.data.msg === "Auth Controller :: Login Successful" && response.data.user) {
				// Store user info in localStorage for frontend use
				localStorage.setItem('user', JSON.stringify({
					id: response.data.user._id,
					name: response.data.user.name,
					email: response.data.user.email,
					role: response.data.user.role
				}));
				
				// Redirect to dashboard after successful login
				navigate('/');
			} else {
				setError(response.data.msg || 'Login failed');
			}
		} catch (error) {
			console.error('Login error:', error);
			setError(
				error.response?.data?.msg || 
				'Login failed. Please check your credentials and try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	const containerVariants = {
		hidden: {
			opacity: 0,
			scale: 0.8,
		},
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.5,
				ease: 'easeOut',
			},
		},
	};

	const leftVariants = {
		hidden: {
			x: '-100%',
			opacity: 0,
		},
		visible: {
			x: 0,
			opacity: 1,
			transition: {
				duration: 0.8,
				ease: 'easeOut',
				delay: 0.3,
			},
		},
	};

	const rightVariants = {
		hidden: {
			x: '100%',
			opacity: 0,
		},
		visible: {
			x: 0,
			opacity: 1,
			transition: {
				duration: 0.8,
				ease: 'easeOut',
				delay: 0.3,
			},
		},
	};

	const glistenVariants = {
		initial: {
			backgroundPosition: '0% 50%',
		},
		animate: {
			backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
			transition: {
				duration: 3,
				repeat: Infinity,
				ease: 'linear',
			},
		},
	};

	return (
		<motion.div
			className="min-h-screen bg-gray-900 flex flex-col md:flex-row"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			{/* Left Section - Description */}
			<motion.div
				className="hidden md:flex md:w-1/2 flex-col justify-center px-12"
				variants={leftVariants}
			>
				<h1 className="text-6xl font-bold mb-8 font-serif tracking-tight">
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
						Welcome{' '}
					</span>
					<motion.span
						className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-300 to-gray-100 bg-[length:200%_100%]"
						variants={glistenVariants}
						initial="initial"
						animate="animate"
					>
						Back
					</motion.span>
				</h1>
				<p className="text-gray-400 text-xl mb-12 leading-relaxed font-light tracking-wide">
					Access your restaurant management dashboard. Manage your menu, track
					orders, and engage with your customers seamlessly.
				</p>
				<div className="space-y-8">
					<div className="flex items-center group">
						<div className="bg-teal-600 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform duration-200">
							<svg
								className="h-6 w-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<span className="text-gray-300 text-lg font-medium group-hover:text-gray-100 transition-colors duration-200 tracking-wide">
							Access your dashboard
						</span>
					</div>
					<div className="flex items-center group">
						<div className="bg-teal-600 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform duration-200">
							<svg
								className="h-6 w-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<span className="text-gray-300 text-lg font-medium group-hover:text-gray-100 transition-colors duration-200 tracking-wide">
							Manage your restaurant
						</span>
					</div>
					<div className="flex items-center group">
						<div className="bg-teal-600 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform duration-200">
							<svg
								className="h-6 w-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<span className="text-gray-300 text-lg font-medium group-hover:text-gray-100 transition-colors duration-200 tracking-wide">
							Track your orders
						</span>
					</div>
				</div>
			</motion.div>

			{/* Right Section - Form */}
			<motion.div
				className="w-full md:w-1/2 flex flex-col justify-center py-12 px-8 bg-gray-800"
				variants={rightVariants}
			>
				<div className="max-w-md w-full mx-auto">
					<div className="px-6 py-5 bg-teal-600 rounded-t-xl">
						<h2 className="text-2xl font-medium text-white">Login</h2>
						<p className="text-teal-50 text-sm mt-1">Sign in to your account</p>
					</div>
					<form
						className="space-y-8 p-6 bg-gray-800 rounded-b-xl"
						onSubmit={handleSubmit}
					>
						{error && (
							<div className="p-4 bg-red-900/50 rounded-md border border-red-700">
								<p className="text-sm text-red-300">{error}</p>
							</div>
						)}

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Email address
							</label>
							<div className="mt-1">
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={formData.email}
									onChange={handleChange}
									className="block w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500 shadow-sm placeholder-gray-400 text-white text-sm transition-colors"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Password
							</label>
							<div className="mt-1">
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									value={formData.password}
									onChange={handleChange}
									className="block w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-teal-500 focus:border-teal-500 shadow-sm placeholder-gray-400 text-white text-sm transition-colors"
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
							>
								{loading ? (
									<span className="flex items-center">
										<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Logging in...
									</span>
								) : "Login"}
							</button>
						</div>
					</form>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default Login;
