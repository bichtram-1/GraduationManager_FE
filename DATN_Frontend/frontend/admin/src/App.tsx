// import 'animate.css';
import { ConfigProvider } from 'antd';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import { lazy, Suspense } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import './App.css';
import Loading from './components/shared/general/Loading';
import PrivateRoute from './components/general/PrivateRoute';
import { COLORS } from '@shared/constants/color';
import { ROUTES } from './constants/routers';

const DefaultLayout = lazy(() => import('./components/layout/DefaultLayout'));
const AuthLayout = lazy(() => import('./components/layout/AuthLayout'));
const Login = lazy(() => import('./pages/login/LoginPage'));
const NotFound = lazy(() => import('./components/general/PageNotFound'));
const Dashboard = lazy(() => import('./pages/dashboard/DashboardPage'));
const Users = lazy(() => import('./pages/users/UsersPage'));
const Companies = lazy(() => import('./pages/companies/CompaniesPage'));
const Topics = lazy(() => import('./pages/topics/TopicsPage'));
const Assignments = lazy(() => import('./pages/assignments/AssignmentsPage'));
const Councils = lazy(() => import('./pages/councils/CouncilsPage'));
const CouncilsCreate = lazy(() => import('./pages/councils/components/CreateCouncilPage'));
const GroupsAdmin = lazy(() => import('./pages/groups/GroupsAdminPage'));
const ReviewGroupsAdmin = lazy(() => import('./pages/groups/ReviewGroupsPage'));
const ThesisStudents = lazy(() => import('./pages/groups/ThesisStudentsPage'));
const InternshipStudents = lazy(() => import('./pages/internship-students/InternshipStudentsPage'));
const Periods = lazy(() => import('./pages/periods/PeriodsPage'));
const StudentScores = lazy(() => import('./pages/student-scores/StudentScoresPage'));
const ClassesAdmin = lazy(() => import('./pages/classes/ClassesAdminPage'));

function App() {
  
  return (
    <ConfigProvider
      componentSize='small'
      theme={{
        token: {
          colorPrimary: COLORS.primary,
          fontSize: 12,
          
        },
        components: {
          Menu: {
            darkItemSelectedBg: COLORS.primary,
          },
          
          Tabs: {
            horizontalItemPadding: '12px 15px',
          },
          Card: {
            paddingLG: 20,
          },
         
        },
      }}
    >
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Root route - redirect to login */}
              <Route path="/" element={<PrivateRoute isPublicOnly={true}><Navigate to={ROUTES.LOGIN} replace /></PrivateRoute>} />

              {/* Những route cần bọc private route để xử lí logic có hay không có token */}
              {/* Những route cần bọc Default Layout */}
              <Route
                element={
                  <PrivateRoute>
                    <DefaultLayout />
                  </PrivateRoute>
                }
              >
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.USERS} element={<Users />} />
                <Route path={ROUTES.COMPANIES} element={<Companies />} />
                <Route path={ROUTES.TOPICS} element={<Topics />} />
                <Route path={ROUTES.COUNCILS} element={<Councils />} />
                <Route path={ROUTES.COUNCILS_CREATE} element={<CouncilsCreate />} />
                <Route path={ROUTES.GROUPS} element={<GroupsAdmin />} />
                <Route path={ROUTES.GROUPS_REVIEW} element={<ReviewGroupsAdmin />} />
                <Route path={ROUTES.GROUPS_STUDENTS} element={<ThesisStudents />} />
                <Route path={ROUTES.CLASSES} element={<ClassesAdmin />} />
                <Route path={ROUTES.ASSIGNMENTS} element={<Assignments />} />
                <Route path={ROUTES.STUDENT_SCORES} element={<StudentScores />} />
                <Route path={ROUTES.INTERNSHIP_STUDENTS} element={<InternshipStudents />} />
                <Route path={ROUTES.INTERNSHIP_STUDENTS_CONFIRM} element={<InternshipStudents />} />
                <Route path={ROUTES.INTERNSHIP_STUDENTS_NOCOMPANY} element={<InternshipStudents />} />
                <Route path={ROUTES.PERIODS} element={<Periods />} />
              </Route>
              {/* Những route cần bọc Auth Layout */}
              <Route
                element={
                  <PrivateRoute isPublicOnly={true}>
                    <AuthLayout />
                  </PrivateRoute>
                }
              >
                <Route path={ROUTES.LOGIN} element={<Login />} />
              </Route>

              {/* Những route không cần bọc private route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
