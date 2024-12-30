import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import Subject from './components/Subject';
import Lectures from './components/Lectures';
import  Attendance  from './components/Attendance';
import ClassPage from './components/class';
import Students from './components/Students';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/class" element={<ClassPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/class/:classId" element={<Subject />} />
        <Route path="/lectures/:subjectId" element={<Lectures />} />
        <Route path="/attendances/:classid/:lectureId" element={<Attendance />} />                
        <Route path="/students" element={<Students />} />                
      </Routes>
    </Router>
  );
}

export default App;
