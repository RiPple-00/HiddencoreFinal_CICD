import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import HomePage from './pages/HomePage';
import StaffLoginPage from './pages/StaffLoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminEmployeeIssuePage from './pages/AdminEmployeeIssuePage';
import EmailConsentPage from './pages/EmailConsentPage';
import SchedulePage from './pages/SchedulePage';
import BoardListPage from './pages/board/BoardListPage';
import BoardDetailPage from './pages/board/BoardDetailPage';
import BoardCreatePage from './pages/board/BoardCreatePage';
import BoardUserPostsPage from './pages/board/BoardUserPostsPage';
import MealEditPage from './pages/MealEditPage';
import MealCarePage from './pages/MealCarePage';
import CalendarPage from './pages/CalendarPage';
import MealTypePage from './pages/MealTypePage';
import MealUploadPage from './pages/MealUploadPage';
import BedRoomPage from './pages/BedRoomPage';
import PatientListPage from './pages/patient/PatientListPage';
import AdminPatientDetailPage from './pages/admin/AdminPatientDetailPage';
import WardPage from './pages/WardPage';
import DoctorMainPage from './pages/DoctorMainPage';
import DoctorPatientListPage from './pages/DoctorPatientListPage';
import DoctorPatientDetailPage from './pages/DoctorPatientDetailPage';
import DoctorHandoverPage from './pages/DoctorHandoverPage';
import DoctorHandoverMemoPage from './pages/DoctorHandoverMemoPage';
import DoctorCalendarPage from './pages/DoctorCalendarPage';
import { useAuth } from './contexts/AutoContext.jsx';



const LOGIN_PATHS = new Set(['/', '/login', '/signup', '/staff-login', '/email-consent']);

function isLoginPath(pathname) {
  return LOGIN_PATHS.has(pathname);
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !isLoginPath(location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  return (
        <Routes>
          {/* <Route path="/" element={<WardPage />} /> */}
          <Route path="/" element={<StaffLoginPage />} />
          <Route path="/home" element={<WardPage />} />
          <Route path="/ward" element={<WardPage />} />
          <Route path="/doctor" element={<DoctorMainPage />} />
          <Route path="/doctor/patients" element={<DoctorPatientListPage />} />
          <Route path="/doctor/patients/:patientCode" element={<DoctorPatientDetailPage />} />
          <Route path="/doctor/handover" element={<DoctorHandoverPage />} />
          <Route path="/doctor/handover/memo" element={<DoctorHandoverMemoPage />} />
          <Route path="/doctor/calendar" element={<DoctorCalendarPage />} />
          <Route path="/signup" element={<StaffLoginPage />} />
          <Route path="/login" element={<StaffLoginPage />} />
          <Route path="/staff-login" element={<StaffLoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/admin/employees" element={<AdminEmployeeIssuePage />} />
          <Route path="/email-consent" element={<EmailConsentPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route
            path="/meal-care"
            element={
              <div className="mx-auto max-w-md p-6">
                <MealCarePage />
              </div>
            }
          />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/meal-edit" element={<MealEditPage />} />
          <Route path="/meal-edit/:date" element={<MealEditPage />} />
          <Route path="/admin/menu/edit/:id" element={<MealEditPage />} />
          <Route path="/meal-type" element={<MealTypePage />} />
          <Route path="/meal-type/:date" element={<MealTypePage />} />
          <Route path="/meal-upload" element={<MealUploadPage />} />
          <Route path="/facilities/:facilityId/board" element={<BoardListPage />} />
          <Route path="/facilities/:facilityId/board/create" element={<BoardCreatePage />} />
          <Route path="/facilities/:facilityId/board/history" element={<BoardUserPostsPage variant="history" />} />
          <Route path="/facilities/:facilityId/board/draft" element={<BoardUserPostsPage variant="draft" />} />
          <Route path="/facilities/:facilityId/board/:postId" element={<BoardDetailPage />} />
          <Route path="/bedroompage/:room" element={<BedRoomPage />} />
          <Route path="/patients" element={<PatientListPage />} />
          <Route path="/patients/:patientId" element={<AdminPatientDetailPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
  );
}

export default App;