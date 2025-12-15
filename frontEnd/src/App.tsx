import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout/Layout';
import { CoursesPage } from './pages/CoursesPage';
import { EnrolmentsPage } from './pages/EnrolmentsPage';
import { AssignPage } from './pages/AssignPage';
import { ReportPage } from './pages/ReportPage';
import { OnboardingTour } from './components/Common/OnboardingTour';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/enrolments" element={<EnrolmentsPage />} />
          <Route path="/assign" element={<AssignPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </Layout>
      <OnboardingTour />
    </BrowserRouter>
  );
}

export default App;
