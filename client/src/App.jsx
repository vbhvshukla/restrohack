import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import OrganizationStructure from './components/OrganizationStructure';
import TeamCreation from './components/TeamCreation';
import TeamViewer from './components/TeamViewer';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<OrganizationStructure />} />
				<Route path="/login" element={<Login />} />
				<Route path="/teams/create" element={<TeamCreation />} />
				<Route path="/teams/view" element={<TeamViewer />} />
			</Routes>
		</Router>
	);
}

export default App;
