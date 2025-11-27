import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import WorkIcon from '@mui/icons-material/Work';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            variant={location.pathname === '/dashboard' ? 'outlined' : 'text'}
          >
            Dashboard
          </Button>
          
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-job')}
            variant={location.pathname === '/create-job' ? 'outlined' : 'text'}
          >
            Create Job
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;