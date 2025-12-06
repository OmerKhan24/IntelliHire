import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Divider,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Description as DocumentIcon,
  QuestionAnswer as QuestionAnswerIcon,
  TrendingUp as TrendingIcon,
  Logout as LogoutIcon,
  AccountCircle as ProfileIcon,
  Chat as ChatIcon,
  WorkspacePremium as BadgeIcon,
  School as SchoolIcon,
  HealthAndSafety as HealthIcon,
  AttachMoney as MoneyIcon,
  EventNote as EventIcon
} from '@mui/icons-material';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalChats: 0,
    questionsAsked: 0,
    lastActive: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Fetch real stats from API
    const fetchStats = async () => {
      try {
        const response = await api.hr.getEmployeeStats();
        setStats({
          totalChats: response.data.total_chats || 0,
          questionsAsked: response.data.questions_asked || 0,
          lastActive: response.data.last_active ? new Date(response.data.last_active).toLocaleDateString() : 'N/A'
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Keep default mock stats if API fails
        setStats({
          totalChats: 0,
          questionsAsked: 0,
          lastActive: new Date().toLocaleDateString()
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const quickAccessCards = [
    {
      title: 'HR Assistant',
      description: 'Chat with our AI assistant for instant answers',
      icon: <BotIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      action: () => navigate('/hr-assistant'),
      color: '#e3f2fd',
      badge: 'AI Powered'
    },
    {
      title: 'Ask a Question',
      description: 'Get quick answers about policies and benefits',
      icon: <QuestionAnswerIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      action: () => navigate('/hr-assistant'),
      color: '#e8f5e9',
      badge: 'Quick Help'
    },
    {
      title: 'View Documents',
      description: 'Access company policies through chat',
      icon: <DocumentIcon sx={{ fontSize: 40, color: '#ed6c02' }} />,
      action: () => navigate('/hr-assistant'),
      color: '#fff3e0',
      badge: 'Resources'
    }
  ];

  const popularTopics = [
    { icon: <MoneyIcon />, text: 'Leave Policy', category: 'policy' },
    { icon: <HealthIcon />, text: 'Health Benefits', category: 'benefits' },
    { icon: <EventIcon />, text: 'Holiday Calendar', category: 'general' },
    { icon: <SchoolIcon />, text: 'Training Programs', category: 'onboarding' },
    { icon: <BadgeIcon />, text: 'Performance Reviews', category: 'procedure' }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: 'white', 
                  color: '#667eea',
                  mr: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'E'}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Welcome, {user?.full_name || user?.username || 'Employee'}! 👋
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Your Employee Portal - Access HR resources and get instant answers
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={handleLogout}
              sx={{ 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                {loading ? (
                  <Skeleton variant="text" width={60} height={60} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" color="primary">
                    {stats.totalChats}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Total Conversations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <HelpIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
                {loading ? (
                  <Skeleton variant="text" width={60} height={60} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" color="success.main">
                    {stats.questionsAsked}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Questions Asked
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingIcon sx={{ fontSize: 40, color: '#ed6c02', mb: 1 }} />
                {loading ? (
                  <Skeleton variant="text" width={100} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h6" color="warning.main">
                    {stats.lastActive}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Last Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Access Section */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Access
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickAccessCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', bgcolor: card.color, minHeight: 180 }}>
                  <Box sx={{ mb: 2 }}>
                    {card.icon}
                  </Box>
                  <Chip 
                    label={card.badge} 
                    size="small" 
                    sx={{ mb: 1 }}
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={card.action}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Popular Topics Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Popular Topics
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quickly access frequently asked questions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {popularTopics.map((topic, index) => (
                  <ListItemButton 
                    key={index}
                    onClick={() => navigate('/hr-assistant')}
                    sx={{ 
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                        {topic.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={topic.text}
                      secondary={`Category: ${topic.category}`}
                    />
                    <Chip label="Ask Now" size="small" color="primary" variant="outlined" />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Help & Support Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Need Help?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Our AI assistant is available 24/7 to help you with:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Company Policies" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Benefits & Leave" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="HR Procedures" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Onboarding Guides" />
                </ListItem>
              </List>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<BotIcon />}
                onClick={() => navigate('/hr-assistant')}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Start Chatting
              </Button>
            </Paper>

            {/* Profile Card */}
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ProfileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {user?.full_name || 'Employee'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email || 'employee@company.com'}
              </Typography>
              <Chip 
                label="Employee" 
                color="primary" 
                size="small" 
                sx={{ mt: 1 }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom Info Banner */}
        <Paper sx={{ p: 2, mt: 3, bgcolor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BotIcon sx={{ fontSize: 32, color: '#1976d2', mr: 2 }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                💡 Tip: You can ask the HR Assistant anything!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From leave policies to benefits information, our AI is trained on all company documents.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmployeeDashboard;
