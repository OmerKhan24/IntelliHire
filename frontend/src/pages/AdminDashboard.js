import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Chip, alpha, Card, CardContent, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'interviewer',
    full_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [usersRes, jobsRes] = await Promise.all([
        api.auth.listUsers(),
        api.jobs.list()
      ]);
      setUsers(usersRes.data.users || []);
      setJobs(jobsRes.data.jobs || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.auth.createUser(newUser);
      alert(`${newUser.role} created successfully!\nUsername: ${newUser.username}\nPassword: ${newUser.password}`);
      setOpenDialog(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'interviewer',
        full_name: '',
        phone: ''
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.auth.updateUser(userId, { is_active: !currentStatus });
      loadData();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const stats = {
    totalUsers: users.length,
    interviewers: users.filter(u => u.role === 'interviewer').length,
    candidates: users.filter(u => u.role === 'candidate').length,
    activeJobs: jobs.filter(j => j.status === 'active').length
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0A192F 100%)',
        position: 'relative',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(8, 145, 178, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(13, 148, 136, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Paper
          elevation={10}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 50, color: '#0891B2' }} />
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 900,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #0891B2 0%, #0D9488 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Admin Dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Welcome back, {user?.username}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 5px 20px rgba(8, 145, 178, 0.4)',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(8, 145, 178, 0.5)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create Interviewer
            </Button>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              className="hover-lift"
              sx={{
                background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(8, 145, 178, 0.3)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  animation: 'float 6s ease-in-out infinite'
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Total Users
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              className="hover-lift"
              sx={{
                background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: -50,
                  left: -50,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  animation: 'float 7s ease-in-out infinite'
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {stats.interviewers}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Interviewers
                    </Typography>
                  </Box>
                  <WorkIcon sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              className="hover-lift"
              sx={{
                background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(217, 119, 6, 0.3)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  animation: 'float 5s ease-in-out infinite'
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {stats.candidates}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Candidates
                    </Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              className="hover-lift"
              sx={{
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: -50,
                  left: -50,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  animation: 'float 8s ease-in-out infinite'
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff' }}>
                      {stats.activeJobs}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>
                      Active Jobs
                    </Typography>
                  </Box>
                  <WorkIcon sx={{ fontSize: 50, color: alpha('#fff', 0.5) }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Users Table */}
        <Paper
          elevation={10}
          sx={{
            background: alpha('#fff', 0.15),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#fff', 0.2)}`,
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 3, borderBottom: `1px solid ${alpha('#fff', 0.2)}` }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
              User Management
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Username</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Full Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ color: alpha('#fff', 0.9) }}>{u.username}</TableCell>
                    <TableCell sx={{ color: alpha('#fff', 0.9) }}>{u.email}</TableCell>
                    <TableCell sx={{ color: alpha('#fff', 0.9) }}>{u.full_name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        sx={{
                          background: u.role === 'admin' ? '#FFD700' : u.role === 'interviewer' ? '#11998e' : '#667eea',
                          color: '#fff',
                          fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={u.is_active ? <CheckCircleIcon /> : <BlockIcon />}
                        label={u.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          background: u.is_active ? '#38ef7d' : '#ff1744',
                          color: '#fff',
                          fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {u.role !== 'admin' && (
                        <IconButton
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          sx={{ color: '#fff' }}
                        >
                          {u.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Create User Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: alpha('#fff', 0.95),
            backdropFilter: 'blur(20px)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          Create New User
        </DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2, p: 2, bgcolor: alpha('#ff1744', 0.1), borderRadius: 1 }}>
              {error}
            </Typography>
          )}
          <TextField
            fullWidth
            label="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Full Name"
            value={newUser.full_name}
            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            margin="normal"
            helperText="User will receive this password"
          />
          <TextField
            fullWidth
            select
            label="Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            margin="normal"
          >
            <MenuItem value="interviewer">Interviewer</MenuItem>
            <MenuItem value="candidate">Candidate</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #11998e 30%, #38ef7d 90%)',
              fontWeight: 700
            }}
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
