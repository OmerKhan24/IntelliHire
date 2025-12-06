import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  LinearProgress,
  Drawer,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const HRAssistant = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [userRole, setUserRole] = useState(''); // 'hr' or 'employee'
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  // Document state
  const [documents, setDocuments] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('policy');
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [stats, setStats] = useState(null);
  
  // Employee management state (HR only)
  const [employees, setEmployees] = useState([]);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: ''
  });
  const [employeeLoading, setEmployeeLoading] = useState(false);
  
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get user role from localStorage or token
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'employee'); // Default to employee if not set
  }, []);

  // Load suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await api.hr.getSuggestions();
        setSuggestions(response.data.suggestions || []);
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    };
    loadSuggestions();
  }, []);

  // Load conversation history on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await api.hr.getConversations();
        setConversations(response.data.conversations || []);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };
    loadConversations();
  }, []);

  // Load documents when switching to documents tab
  useEffect(() => {
    if (activeTab === 1) {
      const loadDocuments = async () => {
        try {
          const response = await api.hr.listDocuments();
          setDocuments(response.data.documents || []);
        } catch (err) {
          setError('Failed to load documents: ' + (err.response?.data?.error || err.message));
        }
      };

      const loadStats = async () => {
        try {
          const response = await api.hr.getDocumentStats();
          setStats(response.data);
        } catch (err) {
          console.error('Failed to load stats:', err);
        }
      };

      loadDocuments();
      loadStats();
    }
  }, [activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.hr.sendMessage({
        message: inputMessage,
        session_id: sessionId
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.message.content,
        sources: response.data.message.sources || [],
        has_context: response.data.message.has_context,
        timestamp: new Date().toISOString(),
        messageId: response.data.message.id
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(response.data.session_id);
      
      // Reload conversations to show updated list
      const convResponse = await api.hr.getConversations();
      setConversations(convResponse.data.conversations || []);
      
    } catch (err) {
      setError('Failed to send message: ' + (err.response?.data?.error || err.message));
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setCurrentConversationId(null);
    setInputMessage('');
    setSidebarOpen(false);
  };

  const handleSelectConversation = async (conversation) => {
    try {
      setLoading(true);
      const response = await api.hr.getConversation(conversation.id);
      
      // Check if response has conversation data
      const conversationData = response.data.conversation || response.data;
      const messages = conversationData.messages || [];
      
      // Load messages from the conversation
      const loadedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        sources: msg.sources || [],
        timestamp: msg.created_at,
        messageId: msg.id
      }));
      
      setMessages(loadedMessages);
      setSessionId(conversation.session_id);
      setCurrentConversationId(conversation.id);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Conversation load error:', err);
      setError('Failed to load conversation: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      setError('Please select a file and provide a title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');
    
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);
    formData.append('description', uploadDescription);
    formData.append('category', uploadCategory);
    formData.append('tags', uploadTags);

    try {
      setUploadProgress(20);
      setUploadStatus('Uploading document...');
      
      await api.hr.uploadDocument(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 60) / progressEvent.total) + 20;
        setUploadProgress(Math.min(percentCompleted, 80));
      });
      
      setUploadProgress(85);
      setUploadStatus('Processing document...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUploadProgress(100);
      setUploadStatus('Upload complete!');
      
      setTimeout(() => {
        setUploadDialogOpen(false);
        resetUploadForm();
        
        // Reload documents and stats
        if (activeTab === 1) {
          api.hr.listDocuments().then(response => {
            setDocuments(response.data.documents || []);
          });
          api.hr.getDocumentStats().then(response => {
            setStats(response.data);
          });
        }
        
        setError('');
      }, 500);
    } catch (err) {
      setUploadProgress(0);
      setUploadStatus('');
      setError('Failed to upload document: ' + (err.response?.data?.error || err.message));
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
      }, 1000);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.hr.deleteDocument(docId);
      
      // Reload documents and stats
      const docsResponse = await api.hr.listDocuments();
      setDocuments(docsResponse.data.documents || []);
      
      const statsResponse = await api.hr.getDocumentStats();
      setStats(statsResponse.data);
    } catch (err) {
      setError('Failed to delete document: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadDescription('');
    setUploadCategory('policy');
    setUploadTags('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      policy: 'primary',
      procedure: 'secondary',
      benefits: 'success',
      onboarding: 'info',
      general: 'default'
    };
    return colors[category] || 'default';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Employee Management Functions
  const loadEmployees = async () => {
    if (userRole !== 'interviewer') return;
    
    try {
      const response = await api.hr.getEmployees();
      setEmployees(response.data.employees || []);
    } catch (err) {
      setError('Failed to load employees: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRegisterEmployee = async () => {
    if (!newEmployee.username || !newEmployee.email || !newEmployee.password || !newEmployee.full_name) {
      setError('Please fill in all required fields');
      return;
    }

    setEmployeeLoading(true);
    try {
      await api.hr.registerEmployee(newEmployee);
      
      // Reload employees
      await loadEmployees();
      
      // Reset form and close dialog
      setNewEmployee({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: ''
      });
      setEmployeeDialogOpen(false);
      setError('');
    } catch (err) {
      setError('Failed to register employee: ' + (err.response?.data?.error || err.message));
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleToggleEmployeeStatus = async (employeeId, currentStatus) => {
    try {
      await api.hr.updateEmployee(employeeId, { is_active: !currentStatus });
      await loadEmployees();
    } catch (err) {
      setError('Failed to update employee: ' + (err.response?.data?.error || err.message));
    }
  };

  // Load employees when switching to employee management tab
  useEffect(() => {
    if (activeTab === 2 && userRole === 'interviewer') {
      loadEmployees();
    }
  }, [activeTab, userRole]);

  return (
    <>
      {/* Chat History Sidebar */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: '#1a1a1a',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Chat History</Typography>
            <IconButton onClick={() => setSidebarOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewChat}
            sx={{ mb: 2, bgcolor: '#2a2a2a', '&:hover': { bgcolor: '#3a3a3a' } }}
          >
            New Chat
          </Button>

          <Divider sx={{ bgcolor: '#3a3a3a', mb: 2 }} />

          <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>
            Previous Conversations
          </Typography>

          <List sx={{ p: 0 }}>
            {conversations.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 4 }}>
                No previous chats
              </Typography>
            ) : (
              conversations.map((conv) => (
                <ListItemButton
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  selected={currentConversationId === conv.id}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: '#2a2a2a',
                      '&:hover': { bgcolor: '#3a3a3a' }
                    },
                    '&:hover': { bgcolor: '#2a2a2a' }
                  }}
                >
                  <ListItemIcon>
                    <BotIcon sx={{ color: '#888' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={conv.title || 'Untitled Chat'}
                    secondary={new Date(conv.started_at).toLocaleDateString()}
                    primaryTypographyProps={{
                      sx: { fontSize: '0.9rem', color: 'white' },
                      noWrap: true
                    }}
                    secondaryTypographyProps={{
                      sx: { fontSize: '0.75rem', color: '#888' }
                    }}
                  />
                </ListItemButton>
              ))
            )}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Menu button to open sidebar */}
          {(activeTab === 0 || userRole !== 'interviewer') && (
            <Fab
              color="primary"
              sx={{
                position: 'fixed',
                left: 16,
                top: 16,
                zIndex: 1000
              }}
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </Fab>
          )}
          
          {/* Back button for employees */}
        {userRole === 'employee' && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/employee-dashboard')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BotIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1">
              {userRole === 'interviewer' ? 'HR Assistant' : 'Employee Portal'}
            </Typography>
            <Typography color="text.secondary">
              {userRole === 'interviewer' 
                ? 'Manage company documents and assist employees' 
                : 'Get answers about company policies and HR information'}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 2 }}>
          {userRole === 'interviewer' ? (
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Chat Assistant" icon={<BotIcon />} iconPosition="start" />
              <Tab label="Document Management" icon={<DocumentIcon />} iconPosition="start" />
              <Tab label="Employee Management" icon={<PersonIcon />} iconPosition="start" />
            </Tabs>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center', backgroundColor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">
                💬 Chat with HR Assistant
              </Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          {/* Chat Tab - Available to everyone */}
          {(activeTab === 0 || userRole !== 'interviewer') && (
            <Box sx={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  p: 2, 
                  mb: 2,
                  backgroundColor: '#f5f5f5'
                }}
              >
                {messages.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <BotIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Welcome to HR Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Ask me anything about company policies, benefits, leave, or HR procedures
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Try asking:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                        {suggestions.slice(0, 4).map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            clickable
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}

                <List>
                  {messages.map((message, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        flexDirection: 'column',
                        alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
                        {message.role === 'assistant' && (
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                            <BotIcon />
                          </Avatar>
                        )}
                        
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            backgroundColor: message.role === 'user' ? 'primary.main' : 'white',
                            color: message.role === 'user' ? 'white' : 'text.primary',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Typography>
                          
                          {message.sources && message.sources.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Divider sx={{ mb: 1 }} />
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Sources:
                              </Typography>
                              {message.sources.map((source, idx) => (
                                <Chip
                                  key={idx}
                                  icon={<DocumentIcon />}
                                  label={source.title}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Paper>

                        {message.role === 'user' && (
                          <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
                            <PersonIcon />
                          </Avatar>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                  {loading && (
                    <ListItem>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                          <BotIcon />
                        </Avatar>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            flex: 1,
                            maxWidth: '80%'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={20} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Processing your query...
                              </Typography>
                              <LinearProgress sx={{ mt: 1, height: 4, borderRadius: 1 }} />
                            </Box>
                          </Box>
                        </Paper>
                      </Box>
                    </ListItem>
                  )}
                  <div ref={messagesEndRef} />
                </List>
              </Paper>

              {/* Input Area - FIXED: No refs, pure controlled component */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about policies, benefits, leave..."
                  multiline
                  maxRows={3}
                  disabled={loading}
                  autoComplete="off"
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={loading || !inputMessage.trim()}
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </Box>
          )}

          {/* Documents Tab - Only for HR */}
          {activeTab === 1 && userRole === 'interviewer' && (
            <Box>
              {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Total Documents
                        </Typography>
                        <Typography variant="h4">
                          {stats.database?.total_documents || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Vector Chunks
                        </Typography>
                        <Typography variant="h4">
                          {stats.vector_store?.total_chunks || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Categories
                        </Typography>
                        <Typography variant="h4">
                          {Object.keys(stats.database?.categories || {}).length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<UploadIcon />}
                          onClick={() => setUploadDialogOpen(true)}
                          sx={{ mt: 1 }}
                        >
                          Upload Document
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              <Typography variant="h6" gutterBottom>
                Company Documents
              </Typography>
              
              {documents.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <DocumentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" paragraph>
                    No documents uploaded yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload First Document
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {documents.map((doc) => (
                    <Grid item xs={12} md={6} key={doc.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" gutterBottom>
                                {doc.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {doc.description || 'No description'}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                <Chip
                                  icon={<CategoryIcon />}
                                  label={doc.category}
                                  size="small"
                                  color={getCategoryColor(doc.category)}
                                />
                                <Chip
                                  label={doc.file_type?.toUpperCase()}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={formatFileSize(doc.file_size)}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Uploaded by {doc.uploader_name || 'Unknown'} • {new Date(doc.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteDocument(doc.id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Employee Management Tab - HR Only */}
          {activeTab === 2 && userRole === 'interviewer' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  Employee Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={() => setEmployeeDialogOpen(true)}
                >
                  Register New Employee
                </Button>
              </Box>

              {employees.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No employees registered yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Register your first employee to get started
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {employees.map((employee) => (
                    <Grid item xs={12} sm={6} md={4} key={employee.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                {employee.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                @{employee.username}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            📧 {employee.email}
                          </Typography>
                          {employee.phone && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              📱 {employee.phone}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            📅 Joined: {new Date(employee.created_at).toLocaleDateString()}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Chip
                              label={employee.is_active ? 'Active' : 'Inactive'}
                              color={employee.is_active ? 'success' : 'default'}
                              size="small"
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleToggleEmployeeStatus(employee.id, employee.is_active)}
                            >
                              {employee.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Paper>

        {/* Upload Dialog - FIXED: All controlled inputs */}
        <Dialog 
          open={uploadDialogOpen} 
          onClose={() => !uploading && setUploadDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          disableEscapeKeyDown={uploading}
        >
          <DialogTitle>Upload Company Document</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => setUploadFile(e.target.files[0])}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <Button
                fullWidth
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
                disabled={uploading}
              >
                {uploadFile ? uploadFile.name : 'Select File (PDF, DOCX, TXT)'}
              </Button>

              <TextField
                fullWidth
                label="Document Title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                required
                disabled={uploading}
                sx={{ mb: 2 }}
                autoComplete="off"
              />

              <TextField
                fullWidth
                label="Description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                multiline
                rows={3}
                disabled={uploading}
                sx={{ mb: 2 }}
                autoComplete="off"
              />

              <TextField
                fullWidth
                select
                label="Category"
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                SelectProps={{ native: true }}
                disabled={uploading}
                sx={{ mb: 2 }}
              >
                <option value="policy">Policy</option>
                <option value="procedure">Procedure</option>
                <option value="benefits">Benefits</option>
                <option value="onboarding">Onboarding</option>
                <option value="general">General</option>
              </TextField>

              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="e.g., leave, vacation, pto"
                helperText="Optional tags for better search"
                disabled={uploading}
                autoComplete="off"
              />
              
              {uploading && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {uploadStatus}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {uploadProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {uploadProgress < 30 && 'Uploading file to server...'}
                    {uploadProgress >= 30 && uploadProgress < 85 && 'Processing document and creating embeddings...'}
                    {uploadProgress >= 85 && uploadProgress < 100 && 'Finalizing...'}
                    {uploadProgress === 100 && '✓ Complete!'}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => { setUploadDialogOpen(false); resetUploadForm(); }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadDocument}
              variant="contained"
              disabled={uploading || !uploadFile || !uploadTitle.trim()}
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Employee Registration Dialog */}
        <Dialog 
          open={employeeDialogOpen} 
          onClose={() => setEmployeeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Register New Employee</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Username"
                value={newEmployee.username}
                onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                required
                disabled={employeeLoading}
                sx={{ mb: 2 }}
                autoComplete="off"
              />

              <TextField
                fullWidth
                label="Full Name"
                value={newEmployee.full_name}
                onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})}
                required
                disabled={employeeLoading}
                sx={{ mb: 2 }}
                autoComplete="off"
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                required
                disabled={employeeLoading}
                sx={{ mb: 2 }}
                autoComplete="off"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                required
                disabled={employeeLoading}
                sx={{ mb: 2 }}
                autoComplete="new-password"
              />

              <TextField
                fullWidth
                label="Phone (Optional)"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                disabled={employeeLoading}
                autoComplete="off"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEmployeeDialogOpen(false)}
              disabled={employeeLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegisterEmployee}
              variant="contained"
              disabled={employeeLoading || !newEmployee.username || !newEmployee.email || !newEmployee.password || !newEmployee.full_name}
              startIcon={employeeLoading ? <CircularProgress size={20} /> : <PersonIcon />}
            >
              {employeeLoading ? 'Registering...' : 'Register Employee'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
    </>
  );
};

export default HRAssistant;