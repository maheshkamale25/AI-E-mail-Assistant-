import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Grid, Paper, Typography, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Box, Switch,
  Card, CardContent, AppBar, Toolbar, Avatar,
  Backdrop, Fab, Tooltip, Alert, Snackbar,
  Badge, IconButton, LinearProgress, Skeleton
} from '@mui/material';
import { 
  DarkMode, LightMode, Email, TrendingUp, 
  AutoAwesome, Analytics, Speed, Send, Refresh,
  NotificationsActive, Settings, Download,
  FilterList, Search, Add, PlayArrow
} from '@mui/icons-material';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CssBaseline from '@mui/material/CssBaseline';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const EmailDashboard = () => {
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Enhanced Theme with Animations
  const lightTheme = createTheme({
    palette: { 
      mode: 'light', 
      primary: { main: '#667eea' },
      secondary: { main: '#4ECDC4' },
      background: { default: '#f8fafc', paper: '#ffffff' }
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      }
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
            }
          }
        }
      }
    }
  });

  const darkTheme = createTheme({
    palette: { 
      mode: 'dark', 
      primary: { main: '#90caf9' },
      secondary: { main: '#4ECDC4' },
      background: { default: '#0a0e27', paper: '#1e1e2e' }
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(255,255,255,0.1)'
            }
          }
        }
      }
    }
  });

  const fetchData = async () => {
    try {
      const [emailsRes, statsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/emails/'),
        axios.get('http://127.0.0.1:8000/api/stats/')
      ]);
      setEmails(emailsRes.data.emails || []);
      setStats(statsRes.data.stats || {});
      setIsLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const processNewEmails = async () => {
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/process-sample/');
      await fetchData();
      setShowAlert(true);
    } catch (error) {
      console.error('Error processing emails:', error);
    }
    setLoading(false);
  };

  const sendResponse = async (emailId) => {
    try {
      await axios.post('http://127.0.0.1:8000/api/send-single-response/', { email_id: emailId });
      setShowAlert(true);
      fetchData();
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced Chart Data with Animations
  const sentimentData = {
    labels: Object.keys(stats.sentiment_distribution || {}),
    datasets: [{
      data: Object.values(stats.sentiment_distribution || {}),
      backgroundColor: [
        'rgba(76, 175, 80, 0.8)',
        'rgba(255, 152, 0, 0.8)', 
        'rgba(244, 67, 54, 0.8)'
      ],
      borderWidth: 0,
      hoverOffset: 12,
      hoverBorderWidth: 4,
      hoverBorderColor: darkMode ? '#fff' : '#000'
    }]
  };

  const priorityData = {
    labels: Object.keys(stats.priority_distribution || {}),
    datasets: [{
      label: 'Email Count',
      data: Object.values(stats.priority_distribution || {}),
      backgroundColor: [
        'rgba(244, 67, 54, 0.8)',
        'rgba(33, 150, 243, 0.8)'
      ],
      borderWidth: 0,
      borderRadius: 12
    }]
  };

  // Activity Timeline Data
  const timelineData = {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [{
      label: 'Email Activity',
      data: [2, 8, 12, 15, 10, 5],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const priorityColors = { 'Urgent': 'error', 'Not urgent': 'primary' };
  const sentimentColors = { 'Negative': 'error', 'Positive': 'success', 'Neutral': 'warning' };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (!isLoaded) {
    return (
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Skeleton variant="rectangular" height={80} sx={{ mb: 3, borderRadius: 2 }} />
          <Grid container spacing={3}>
            {[...Array(4)].map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      
      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring', stiffness: 300 }}
        >
          <Tooltip title="Refresh Data">
            <Fab 
              color="primary" 
              onClick={fetchData}
              sx={{ 
                mr: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <Refresh />
            </Fab>
          </Tooltip>
        </motion.div>
      </Box>

      {/* Enhanced Backdrop for Loading */}
      <Backdrop open={loading} sx={{ zIndex: 9999 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <AutoAwesome sx={{ fontSize: 60, color: '#667eea' }} />
        </motion.div>
        <Typography variant="h6" sx={{ ml: 2, color: 'white' }}>
          AI Processing Magic...
        </Typography>
      </Backdrop>

      {/* Success Alert */}
      <Snackbar 
        open={showAlert} 
        autoHideDuration={4000} 
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 3 }}>
          ✨ Operation completed successfully!
        </Alert>
      </Snackbar>

      {/* Animated Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <AppBar position="static" elevation={0} sx={{ 
          background: darkMode 
            ? 'linear-gradient(135deg, #0a0e27 0%, #1e1e2e 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          mb: 4,
          borderRadius: '0 0 24px 24px'
        }}>
          <Toolbar sx={{ py: 1 }}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <AutoAwesome sx={{ mr: 2, color: '#FFD700', fontSize: 32 }} />
            </motion.div>
            
            <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              🤖 AI Email Assistant
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Intelligent Customer Communication Hub
              </Typography>
            </Typography>
            
            <Badge badgeContent={emails.length} color="error" sx={{ mr: 2 }}>
              <IconButton color="inherit">
                <NotificationsActive />
              </IconButton>
            </Badge>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {darkMode ? <DarkMode /> : <LightMode />}
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                sx={{ 
                  '& .MuiSwitch-thumb': { 
                    background: darkMode ? '#90caf9' : '#667eea' 
                  }
                }}
              />
            </Box>
          </Toolbar>
        </AppBar>
      </motion.div>

      <Container maxWidth="xl">
        
        {/* Enhanced Stats Cards with Staggered Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: 'Total Emails',
                value: stats.total_emails || 0,
                icon: <Email />,
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                growth: '+12%'
              },
              {
                title: 'Last 24 Hours',
                value: stats.emails_24h || 0,
                icon: <TrendingUp />,
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                growth: '+5%'
              },
              {
                title: 'Urgent Priority',
                value: (stats.priority_distribution || {})['Urgent'] || 0,
                icon: <Speed />,
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                growth: '-3%'
              },
              {
                title: 'AI Response Rate',
                value: '94%',
                icon: <AutoAwesome />,
                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                growth: '+8%'
              }
            ].map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <Card 
                    elevation={8}
                    sx={{ 
                      background: card.gradient,
                      color: 'white',
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255,255,255,0.1)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover::before': {
                        opacity: 1
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, position: 'relative' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Avatar sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            width: 64, 
                            height: 64,
                            fontSize: 28
                          }}>
                            {card.icon}
                          </Avatar>
                        </motion.div>
                        <Box sx={{ ml: 'auto' }}>
                          <Chip 
                            label={card.growth} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.2)', 
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.8rem'
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, type: 'spring' }}
                      >
                        <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
                          {card.value}
                        </Typography>
                      </motion.div>
                      
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        {card.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Enhanced Process Button with Pulse Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={loading ? { scale: [1, 1.05, 1] } : {}}
              transition={loading ? { repeat: Infinity, duration: 1 } : {}}
            >
              <Button
                variant="contained"
                size="large"
                onClick={processNewEmails}
                disabled={loading}
                startIcon={loading ? <Speed className="spinning" /> : <AutoAwesome />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  px: 8,
                  py: 3,
                  borderRadius: 4,
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transition: 'left 0.6s ease'
                  },
                  '&:hover::before': {
                    left: '100%'
                  }
                }}
              >
                {loading ? 'Processing AI Magic...' : '✨ Process New Emails with AI'}
              </Button>
            </motion.div>
          </Box>
        </motion.div>

        {/* Enhanced Charts with 3D Effects */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          
          {/* Sentiment Analysis */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card elevation={12} sx={{ 
                borderRadius: 4,
                background: darkMode 
                  ? 'linear-gradient(145deg, #1e1e2e 0%, #2a2a4a 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: `1px solid ${darkMode ? '#333' : '#e2e8f0'}`,
                height: 480
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Analytics sx={{ mr: 2, color: '#667eea', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        Sentiment Analysis
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customer emotion insights
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ height: 320, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {Object.keys(stats.sentiment_distribution || {}).length > 0 ? (
                      <Pie 
                        data={sentimentData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { 
                              position: 'bottom',
                              labels: { 
                                padding: 20,
                                usePointStyle: true,
                                font: { size: 14, weight: 'bold' }
                              }
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              titleColor: '#fff',
                              bodyColor: '#fff',
                              cornerRadius: 8
                            }
                          },
                          animation: {
                            animateRotate: true,
                            animateScale: true,
                            duration: 2000
                          }
                        }}
                      />
                    ) : (
                      <Typography color="text.secondary">No data available</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Priority Distribution */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card elevation={12} sx={{ 
                borderRadius: 4,
                background: darkMode 
                  ? 'linear-gradient(145deg, #1e1e2e 0%, #2a2a4a 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: `1px solid ${darkMode ? '#333' : '#e2e8f0'}`,
                height: 480
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUp sx={{ mr: 2, color: '#4ECDC4', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        Priority Distribution
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email urgency levels
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ height: 320 }}>
                    {Object.keys(stats.priority_distribution || {}).length > 0 ? (
                      <Bar 
                        data={priorityData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { 
                              beginAtZero: true,
                              grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                              ticks: { color: darkMode ? '#fff' : '#000' }
                            },
                            x: { 
                              grid: { display: false },
                              ticks: { color: darkMode ? '#fff' : '#000' }
                            }
                          },
                          animation: {
                            duration: 2000,
                            easing: 'easeOutBounce'
                          }
                        }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography color="text.secondary">No data available</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Activity Timeline */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card elevation={12} sx={{ 
                borderRadius: 4,
                background: darkMode 
                  ? 'linear-gradient(145deg, #1e1e2e 0%, #2a2a4a 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: `1px solid ${darkMode ? '#333' : '#e2e8f0'}`,
                height: 480
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PlayArrow sx={{ mr: 2, color: '#FF6B6B', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        Activity Timeline
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Daily email flow
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ height: 320 }}>
                    <Line 
                      data={timelineData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { 
                            beginAtZero: true,
                            grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                            ticks: { color: darkMode ? '#fff' : '#000' }
                          },
                          x: { 
                            grid: { display: false },
                            ticks: { color: darkMode ? '#fff' : '#000' }
                          }
                        },
                        elements: {
                          point: {
                            radius: 6,
                            hoverRadius: 10,
                            backgroundColor: '#667eea',
                            borderWidth: 3,
                            borderColor: '#fff'
                          }
                        },
                        animation: {
                          duration: 2000,
                          easing: 'easeInOutQuart'
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Enhanced Email Table */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card elevation={12} sx={{ 
            borderRadius: 4,
            background: darkMode 
              ? 'linear-gradient(145deg, #1e1e2e 0%, #2a2a4a 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${darkMode ? '#333' : '#e2e8f0'}`,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              p: 4, 
              background: darkMode 
                ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 2, fontSize: 28 }} />
                Recent Support Emails
                <Badge 
                  badgeContent={emails.length} 
                  color="error" 
                  sx={{ ml: 2 }}
                />
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <IconButton sx={{ color: 'white' }}>
                    <Search />
                  </IconButton>
                  <IconButton sx={{ color: 'white' }}>
                    <FilterList />
                  </IconButton>
                  <IconButton sx={{ color: 'white' }}>
                    <Download />
                  </IconButton>
                </Box>
              </Typography>
            </Box>
            
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Sender', 'Subject', 'Priority', 'Sentiment', 'Status', 'Actions'].map((header) => (
                      <TableCell 
                        key={header}
                        sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '1rem',
                          backgroundColor: darkMode ? '#2a2a4a' : '#f8fafc',
                          borderBottom: `2px solid ${darkMode ? '#667eea' : '#667eea'}`
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {emails.slice(0, 10).map((email, index) => (
                      <motion.tr
                        key={email.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedEmail(email)}
                        component={TableRow}
                        hover
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              width: 40, 
                              height: 40, 
                              mr: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontSize: '1rem',
                              fontWeight: 'bold'
                            }}>
                              {email.sender.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight="500">
                              {email.sender}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300, fontWeight: '500' }}>
                            {email.subject}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            <Chip 
                              label={email.priority} 
                              color={priorityColors[email.priority]}
                              size="small"
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                              }}
                            />
                          </motion.div>
                        </TableCell>
                        
                        <TableCell>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            <Chip 
                              label={email.sentiment}
                              color={sentimentColors[email.sentiment]}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                              }}
                            />
                          </motion.div>
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            label={email.status}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              borderWidth: 2
                            }}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              size="small" 
                              startIcon={<Send />}
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                sendResponse(email.id);
                              }}
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                                fontWeight: 'bold',
                                '&:hover': {
                                  boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)'
                                }
                              }}
                            >
                              Send Response
                            </Button>
                          </motion.div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </motion.div>

      </Container>

      {/* Global Styles */}
      <style jsx global>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
          100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
        }
      `}</style>
    </ThemeProvider>
  );
};

export default EmailDashboard;
