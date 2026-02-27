import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ElderlyListPage from './pages/ElderlyListPage';
import AddElderlyPage from './pages/AddElderlyPage';
import SchedulesPage from './pages/SchedulesPage';
import AddSchedulePage from './pages/AddSchedulePage';
import ReminderLogsPage from './pages/ReminderLogsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AiAssistantPage from './pages/AiAssistantPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <DashboardPage />
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    visible: false
  },
  {
    name: 'Elderly List',
    path: '/elderly',
    element: <ElderlyListPage />
  },
  {
    name: 'Add Elderly',
    path: '/elderly/new',
    element: <AddElderlyPage />,
    visible: false
  },
  {
    name: 'Schedules',
    path: '/schedules',
    element: <SchedulesPage />
  },
  {
    name: 'Add Schedule',
    path: '/schedules/new',
    element: <AddSchedulePage />,
    visible: false
  },
  {
    name: 'Reminder Logs',
    path: '/logs',
    element: <ReminderLogsPage />
  },
  {
    name: 'AI Assistant',
    path: '/ai-assistant',
    element: <AiAssistantPage />
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <ProfilePage />
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <AdminPage />,
    visible: false
  }
];

export default routes;
