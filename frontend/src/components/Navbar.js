import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WorkIcon from '@mui/icons-material/Work';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'interviewer') return '/dashboard';
    if (user.role === 'candidate') return '/my-interviews';
    return '/';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    if (user.role === 'admin') return 'Admin Panel';
    if (user.role === 'interviewer') return 'Dashboard';
    if (user.role === 'candidate') return 'My Interviews';
    return 'Dashboard';
  };

  const getDashboardIcon = () => {
    if (!user) return <DashboardIcon />;
    if (user.role === 'admin') return <AdminPanelSettingsIcon />;
    if (user.role === 'interviewer') return <DashboardIcon />;
    if (user.role === 'candidate') return <AssignmentIcon />;
    return <DashboardIcon />;
  };

  const dashboardPath = getDashboardPath();
  const isOnDashboard = location.pathname === dashboardPath || 
                        (user?.role === 'interviewer' && location.pathname === '/dashboard') ||
                        (user?.role === 'candidate' && location.pathname === '/my-interviews') ||
                        (user?.role === 'admin' && location.pathname === '/admin');

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
          <WorkIcon sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            IntelliHire
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            color="inherit"
            startIcon={getDashboardIcon()}
            onClick={() => navigate(dashboardPath)}
            variant={isOnDashboard ? 'outlined' : 'text'}
          >
            {getDashboardLabel()}
          </Button>
          
          {user?.role === 'interviewer' && (
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-job')}
              variant={location.pathname === '/create-job' ? 'outlined' : 'text'}
            >
              Create Job
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;