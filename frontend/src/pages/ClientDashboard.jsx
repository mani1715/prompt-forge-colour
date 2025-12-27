import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import clientService from '../services/clientService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  LogOut, Download, Calendar, FileText, Briefcase, TrendingUp, Clock, 
  CheckCircle2, AlertCircle, Sparkles, Users, Building2, Star, MessageSquare, 
  Send, Target, ListChecks, DollarSign, Activity, MessageCircle, User
} from 'lucide-react';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('client_token');
    const clientData = localStorage.getItem('client_data');

    if (!token || !clientData) {
      navigate('/client/login');
      return;
    }

    setClient(JSON.parse(clientData));
    fetchProjects(token);
    
    // Auto-refresh projects every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchProjects(token);
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  useEffect(() => {
    if (selectedProject && activeTab === 'chat') {
      fetchChatMessages();
      
      // Auto-refresh chat messages every 10 seconds when on chat tab
      const chatRefreshInterval = setInterval(() => {
        fetchChatMessages();
      }, 10000); // 10 seconds
      
      return () => clearInterval(chatRefreshInterval);
    }
  }, [selectedProject, activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProjects = async (token) => {
    try {
      const response = await api.get('/client/projects', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProjects(response.data);
      
      // If we have a selected project, update it with latest data
      if (selectedProject) {
        const updatedSelectedProject = response.data.find(p => p.id === selectedProject.id);
        if (updatedSelectedProject) {
          setSelectedProject(updatedSelectedProject);
        }
      } else if (response.data.length > 0) {
        // No project selected yet, select the first one
        setSelectedProject(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      } else {
        toast.error('Failed to fetch projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    if (!selectedProject) return;
    
    const token = localStorage.getItem('client_token');
    try {
      const messages = await clientService.getClientChatMessages(selectedProject.id, token);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedProject) return;

    setSendingMessage(true);
    const token = localStorage.getItem('client_token');

    try {
      await clientService.sendClientChatMessage(selectedProject.id, chatMessage, token);
      setChatMessage('');
      fetchChatMessages();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedProject) return;

    setSubmittingComment(true);
    const token = localStorage.getItem('client_token');

    try {
      await clientService.addClientComment(selectedProject.id, commentText, token);
      setCommentText('');
      // Refresh project data
      const response = await api.get('/client/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      const updated = response.data.find(p => p.id === selectedProject.id);
      setSelectedProject(updated);
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_data');
    navigate('/client/login');
    toast.success('👋 Logged out successfully');
  };

  const downloadFile = async (projectId, fileId, filename) => {
    const token = localStorage.getItem('client_token');
    try {
      const response = await api.get(
        `/client/projects/${projectId}/files/${fileId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('📥 File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-300',
      in_progress: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-300',
      review: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-300',
      completed: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      in_progress: <TrendingUp className="w-4 h-4" />,
      review: <AlertCircle className="w-4 h-4" />,
      completed: <CheckCircle2 className="w-4 h-4" />
    };
    return icons[status] || null;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      review: 'Under Review',
      completed: 'Completed'
    };
    return labels[status] || status;
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-gradient-to-r from-red-500 to-orange-500';
    if (progress < 70) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
  };

  const getMilestoneStatus = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTaskStatus = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-purple-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100" data-testid="client-dashboard">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg p-2">
                <img 
                  src="/mspn-logo-transparent.png" 
                  alt="MSPN DEV Logo" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)'
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent" data-testid="client-name">
                  Welcome back, {client?.name}! 👋
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {client?.email}
                  </p>
                  {client?.company && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {client.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
              data-testid="client-logout-btn"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Projects</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{projects.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">In Progress</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">
                    {projects.filter(p => p.status === 'in_progress').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg relative">
                  <TrendingUp className="w-8 h-8 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 bg-white">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">No projects assigned yet</p>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Your project manager will assign projects to you soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Project List */}
            <div className="lg:col-span-1">
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-lg">Your Projects</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => {
                          setSelectedProject(project);
                          setActiveTab('overview');
                        }}
                        className={`p-4 cursor-pointer hover:bg-purple-50 transition-colors ${
                          selectedProject?.id === project.id ? 'bg-purple-100 border-l-4 border-purple-600' : ''
                        }`}
                        data-testid={`project-item-${project.id}`}
                      >
                        <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                        <Badge className={`${getStatusColor(project.status)} text-xs`}>
                          {getStatusLabel(project.status)}
                        </Badge>
                        <div className="mt-2">
                          <Progress value={project.progress} className="h-1.5" />
                          <p className="text-xs text-gray-600 mt-1">{project.progress}% Complete</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            <div className="lg:col-span-3">
              {selectedProject ? (
                <Card className="border-2 border-purple-200 shadow-lg">
                  <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          {selectedProject.name}
                          <Sparkles className="w-5 h-5 text-purple-500" />
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {selectedProject.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(selectedProject.status)} px-3 py-1.5 font-semibold flex items-center gap-1.5`}>
                        {getStatusIcon(selectedProject.status)}
                        {getStatusLabel(selectedProject.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
                        <TabsTrigger value="overview" className="text-xs lg:text-sm">
                          <Briefcase className="w-4 h-4 mr-1" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="milestones" className="text-xs lg:text-sm">
                          <Target className="w-4 h-4 mr-1" />
                          Milestones
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="text-xs lg:text-sm">
                          <ListChecks className="w-4 h-4 mr-1" />
                          Tasks
                        </TabsTrigger>
                        <TabsTrigger value="team" className="text-xs lg:text-sm">
                          <Users className="w-4 h-4 mr-1" />
                          Team
                        </TabsTrigger>
                        <TabsTrigger value="budget" className="text-xs lg:text-sm">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Budget
                        </TabsTrigger>
                        <TabsTrigger value="files" className="text-xs lg:text-sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Files
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="text-xs lg:text-sm">
                          <Activity className="w-4 h-4 mr-1" />
                          Activity
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="text-xs lg:text-sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Chat
                        </TabsTrigger>
                      </TabsList>

                      {/* Overview Tab */}
                      <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Progress</p>
                            <p className="text-3xl font-bold text-blue-600">{selectedProject.progress}%</p>
                            <Progress value={selectedProject.progress} className="h-2 mt-2" />
                          </div>
                          {selectedProject.expected_delivery && (
                            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                              <p className="text-sm text-gray-600 mb-1">Expected Delivery</p>
                              <p className="text-lg font-semibold text-purple-700">
                                {new Date(selectedProject.expected_delivery).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}
                        </div>

                        {selectedProject.notes && (
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-5">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-purple-600" />
                              Notes from Project Manager
                            </h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {selectedProject.notes}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Milestones Tab */}
                      <TabsContent value="milestones" className="space-y-4">
                        {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                          selectedProject.milestones.map((milestone) => (
                            <div key={milestone.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                                  {milestone.description && (
                                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                  )}
                                </div>
                                <Badge className={getMilestoneStatus(milestone.status)}>
                                  {milestone.status}
                                </Badge>
                              </div>
                              {milestone.due_date && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(milestone.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-8">No milestones defined yet</p>
                        )}
                      </TabsContent>

                      {/* Tasks Tab */}
                      <TabsContent value="tasks" className="space-y-4">
                        {selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                          selectedProject.tasks.map((task) => (
                            <div key={task.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <CheckCircle2 
                                    className={`w-5 h-5 mt-0.5 ${
                                      task.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                                    }`} 
                                  />
                                  <div className="flex-1">
                                    <h4 className={`font-semibold ${
                                      task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                                    }`}>
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                    )}
                                    {task.due_date && (
                                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge className={getTaskStatus(task.status)}>
                                  {task.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-8">No tasks assigned yet</p>
                        )}
                      </TabsContent>

                      {/* Team Tab */}
                      <TabsContent value="team" className="space-y-4">
                        {selectedProject.team_members && selectedProject.team_members.length > 0 ? (
                          selectedProject.team_members.map((member, idx) => (
                            <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{member.admin_name}</h4>
                                {member.role && (
                                  <p className="text-sm text-gray-600">{member.role}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Added {new Date(member.added_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-8">No team members assigned yet</p>
                        )}
                      </TabsContent>

                      {/* Budget Tab */}
                      <TabsContent value="budget">
                        {selectedProject.budget ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                                <p className="text-2xl font-bold text-blue-600">
                                  {selectedProject.budget.currency} {selectedProject.budget.total_amount.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Paid</p>
                                <p className="text-2xl font-bold text-green-600">
                                  {selectedProject.budget.currency} {selectedProject.budget.paid_amount.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Pending</p>
                                <p className="text-2xl font-bold text-orange-600">
                                  {selectedProject.budget.currency} {selectedProject.budget.pending_amount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {selectedProject.budget.payment_terms && (
                              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {selectedProject.budget.payment_terms}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">No budget information available</p>
                        )}
                      </TabsContent>

                      {/* Files Tab */}
                      <TabsContent value="files" className="space-y-4">
                        {selectedProject.files && selectedProject.files.length > 0 ? (
                          selectedProject.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between bg-gradient-to-r from-white to-indigo-50 border-2 border-indigo-200 p-4 rounded-xl hover:shadow-lg transition-all"
                              data-testid={`project-file-${file.id}`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                                  <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{file.filename}</p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => downloadFile(selectedProject.id, file.id, file.filename)}
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                                data-testid={`download-file-btn-${file.id}`}
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-8">No files uploaded yet</p>
                        )}
                      </TabsContent>

                      {/* Activity Tab */}
                      <TabsContent value="activity" className="space-y-3 max-h-[500px] overflow-y-auto">
                        {selectedProject.activity_log && selectedProject.activity_log.length > 0 ? (
                          selectedProject.activity_log.map((activity) => (
                            <div key={activity.id} className="bg-white border-l-4 border-purple-500 p-4 rounded-r-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{activity.description}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    by {activity.user_name} • {new Date(activity.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <Badge variant="outline">{activity.action}</Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-8">No activity yet</p>
                        )}
                      </TabsContent>

                      {/* Chat Tab */}
                      <TabsContent value="chat">
                        <div className="space-y-4">
                          {/* Chat Messages */}
                          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 h-[400px] overflow-y-auto">
                            {chatMessages.length > 0 ? (
                              <div className="space-y-4">
                                {chatMessages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div
                                      className={`max-w-[70%] rounded-lg p-3 ${
                                        msg.sender_type === 'client'
                                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                          : 'bg-gray-100 text-gray-900'
                                      }`}
                                    >
                                      <p className="text-xs font-semibold mb-1 opacity-80">
                                        {msg.sender_name}
                                      </p>
                                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                      <p className="text-xs mt-1 opacity-70">
                                        {new Date(msg.created_at).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                <div ref={chatEndRef} />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">No messages yet. Start a conversation!</p>
                              </div>
                            )}
                          </div>

                          {/* Chat Input */}
                          <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Textarea
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Type your message..."
                              className="flex-1"
                              rows={2}
                              disabled={sendingMessage}
                            />
                            <Button
                              type="submit"
                              disabled={sendingMessage || !chatMessage.trim()}
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </form>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-gray-300">
                  <CardContent className="py-16 text-center">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">Select a project to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
