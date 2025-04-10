import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import OrganizationStructure from './components/OrganizationStructure';
import PositionForm from './components/PositionForm';
import TeamForm from './components/TeamForm';
import UserForm from './components/UserForm';
import DepartmentForm from './components/DepartmentForm';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<OrganizationStructure />} />
				<Route path="/login" element={<Login />} />
				<Route path="/positions/add" element={<PositionForm />} />
				<Route path="/teams/add" element={<TeamForm />} />
				<Route path="/users/add" element={<UserForm />} />
				<Route path="/departments/add" element={<DepartmentForm />} />
			</Routes>
		</Router>
	);
}

export default App;
