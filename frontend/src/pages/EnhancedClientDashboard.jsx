import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { submitClientTestimonial, getProjectTestimonial, updateClientTestimonial } from '../services/testimonialService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import {
  LogOut, Download, Calendar, FileText, Briefcase, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Sparkles, Users, Building2, Star, MessageSquare, Send, DollarSign,
  Target, ListTodo, MessageCircle, Activity, User
} from 'lucide-react';

export default function EnhancedClientDashboard() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);
  
  // Testimonial states
  const [testimonialData, setTestimonialData] = useState(null);
  const [loadingTestimonial, setLoadingTestimonial] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    role: '',
    message: '',
    rating: 5
  });

  useEffect(() => {
    const token = localStorage.getItem('client_token');
    const clientData = localStorage.getItem('client_data');

    if (!token || !clientData) {
      navigate('/client/login');
      return;
    }

    setClient(JSON.parse(clientData));
    fetchProjects(token);
  }, [navigate]);

  useEffect(() => {
    if (selectedProject && activeTab === 'chat') {
      fetchChatMessages();
    }
    if (selectedProject && activeTab === 'testimonial' && selectedProject.status === 'completed') {
      fetchTestimonialData();
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
    setLoadingChat(true);

    try {
      const response = await api.get(`/client/projects/${selectedProject.id}/chat`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Failed to load chat messages');
    } finally {
      setLoadingChat(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !selectedProject) return;

    const token = localStorage.getItem('client_token');
    setSendingChat(true);

    try {
      await api.post(
        `/client/projects/${selectedProject.id}/chat`,
        { message: chatMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setChatMessage('');
      fetchChatMessages();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingChat(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_data');
    navigate('/client/login');
    toast.success('👋 Logged out successfully');
  };

  const fetchTestimonialData = async () => {
    if (!selectedProject) return;
    
    setLoadingTestimonial(true);
    try {
      const data = await getProjectTestimonial(selectedProject.id);
      if (data.exists) {
        setTestimonialData(data.testimonial);
        setTestimonialForm({
          role: data.testimonial.role || '',
          message: data.testimonial.message,
          rating: data.testimonial.rating
        });
      } else {
        setTestimonialData(null);
        setTestimonialForm({
          role: '',
          message: '',
          rating: 5
        });
      }
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      toast.error('Failed to load testimonial data');
    } finally {
      setLoadingTestimonial(false);
    }
  };

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    if (!selectedProject || !testimonialForm.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoadingTestimonial(true);
    try {
      if (testimonialData) {
        // Update existing testimonial
        await updateClientTestimonial(testimonialData.id, testimonialForm);
        toast.success('✅ Testimonial updated successfully!');
      } else {
        // Submit new testimonial
        await submitClientTestimonial(selectedProject.id, testimonialForm);
        toast.success('✅ Thank you for your testimonial! It has been submitted for review.');
      }
      fetchTestimonialData();
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to submit testimonial';
      toast.error(errorMessage);
    } finally {
      setLoadingTestimonial(false);
    }
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-gradient-to-r from-red-500 to-orange-500';
    if (progress < 70) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
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
                  alt="Prompt Forge Logo" 
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

        {/* Projects List */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1">
              {projects.length} Active
            </Badge>
          </div>

          {projects.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-white">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">No projects assigned yet</p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Your project manager will assign projects to you soon. You'll receive an email notification when new projects are added.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 bg-white"
                  data-testid={`project-card-${project.id}`}
                >
                  <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-purple-50 cursor-pointer"
                    onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {project.name}
                          <Sparkles className="w-5 h-5 text-purple-500" />
                        </CardTitle>
                        <CardDescription className="mt-2 text-gray-600">
                          {project.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(project.status)} px-3 py-1.5 font-semibold flex items-center gap-1.5`} data-testid={`project-status-${project.id}`}>
                        {getStatusIcon(project.status)}
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                          Progress
                        </span>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent" data-testid={`project-progress-${project.id}`}>
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(project.progress)} transition-all duration-500 rounded-full`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Expected Delivery */}
                    {project.expected_delivery && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Expected Delivery:</span>
                        <span className="font-semibold text-blue-700">
                          {new Date(project.expected_delivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    )}

                    {/* Expanded View with Tabs */}
                    {selectedProject?.id === project.id && (
                      <div className="mt-6 pt-6 border-t-2 border-purple-100">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-8 mb-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="milestones">Milestones</TabsTrigger>
                            <TabsTrigger value="tasks">Tasks</TabsTrigger>
                            <TabsTrigger value="team">Team</TabsTrigger>
                            <TabsTrigger value="budget">Budget</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="chat" className="relative">
                              Chat
                              {project.chat_messages?.filter(m => m.sender_type === 'admin' && !m.read).length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {project.chat_messages.filter(m => m.sender_type === 'admin' && !m.read).length}
                                </span>
                              )}
                            </TabsTrigger>
                            {project.status === 'completed' && (
                              <TabsTrigger value="testimonial">
                                <Star className="w-4 h-4 mr-1" />
                                Review
                              </TabsTrigger>
                            )}
                          </TabsList>

                          <TabsContent value="overview" className="space-y-6">
                            {/* Notes */}
                            {project.notes && (
                              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-5">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                                  <FileText className="w-5 h-5 text-purple-600" />
                                  Notes from Project Manager
                                </h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {project.notes}
                                </p>
                              </div>
                            )}

                            {/* Files */}
                            {project.files && project.files.length > 0 && (
                              <div>
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                  <FileText className="w-5 h-5 text-indigo-600" />
                                  Project Files
                                  <Badge className="bg-indigo-100 text-indigo-700">{project.files.length}</Badge>
                                </h4>
                                <div className="space-y-3">
                                  {project.files.map((file) => (
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
                                            Uploaded {new Date(file.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          downloadFile(project.id, file.id, file.filename);
                                        }}
                                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                                        data-testid={`download-file-btn-${file.id}`}
                                      >
                                        <Download className="w-4 h-4" />
                                        Download
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="milestones" className="space-y-4">
                            {project.milestones && project.milestones.length > 0 ? (
                              <div className="space-y-4">
                                {project.milestones.sort((a, b) => a.order - b.order).map((milestone, index) => (
                                  <Card key={milestone.id} className="border-2 border-purple-200">
                                    <CardContent className="pt-6">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3 flex-1">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                            milestone.status === 'completed' ? 'bg-green-500' : 
                                            milestone.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                                          }`}>
                                            {index + 1}
                                          </div>
                                          <div className="flex-1">
                                            <h5 className="font-bold text-lg text-gray-900">{milestone.title}</h5>
                                            {milestone.description && (
                                              <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                            )}
                                          </div>
                                        </div>
                                        <Badge className={getStatusColor(milestone.status)}>
                                          {getStatusIcon(milestone.status)}
                                          {getStatusLabel(milestone.status)}
                                        </Badge>
                                      </div>
                                      {milestone.due_date && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                                          <Target className="w-4 h-4" />
                                          Due: {new Date(milestone.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No milestones defined yet</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="tasks" className="space-y-4">
                            {project.tasks && project.tasks.length > 0 ? (
                              <div className="space-y-3">
                                {project.tasks.map((task) => (
                                  <Card key={task.id} className="border-2 border-blue-200">
                                    <CardContent className="pt-4">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                            task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                          }`}>
                                            {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                          </div>
                                          <div className="flex-1">
                                            <h5 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                              {task.title}
                                            </h5>
                                            {task.description && (
                                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                              <Badge className={getPriorityColor(task.priority)} size="sm">
                                                {task.priority}
                                              </Badge>
                                              {task.due_date && (
                                                <span className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <Badge className={getStatusColor(task.status)}>
                                          {getStatusLabel(task.status)}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <ListTodo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No tasks defined yet</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="team" className="space-y-4">
                            {project.team_members && project.team_members.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.team_members.map((member) => (
                                  <Card key={member.admin_id} className="border-2 border-purple-200">
                                    <CardContent className="pt-6">
                                      <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                          <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                          <p className="font-bold text-gray-900">{member.admin_name}</p>
                                          {member.role && (
                                            <p className="text-sm text-gray-600">{member.role}</p>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No team members assigned yet</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="budget" className="space-y-4">
                            {project.budget ? (
                              <Card className="border-2 border-green-200">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                    Budget Overview
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                      <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                                      <p className="text-2xl font-bold text-blue-600">
                                        {project.budget.currency} {project.budget.total_amount.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                      <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
                                      <p className="text-2xl font-bold text-green-600">
                                        {project.budget.currency} {project.budget.paid_amount.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                      <p className="text-sm text-gray-600 mb-1">Pending Amount</p>
                                      <p className="text-2xl font-bold text-orange-600">
                                        {project.budget.currency} {project.budget.pending_amount.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  {project.budget.payment_terms && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <p className="text-sm font-semibold text-gray-700 mb-2">Payment Terms:</p>
                                      <p className="text-sm text-gray-600">{project.budget.payment_terms}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ) : (
                              <div className="text-center py-12">
                                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Budget information not available</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="activity" className="space-y-4">
                            {project.activity_log && project.activity_log.length > 0 ? (
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {project.activity_log.slice().reverse().map((activity) => (
                                  <Card key={activity.id} className="border border-gray-200">
                                    <CardContent className="pt-4">
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                          <Activity className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm text-gray-900">{activity.description}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">{activity.user_name}</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">
                                              {new Date(activity.timestamp).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No activity recorded yet</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="chat" className="space-y-4">
                            <Card className="border-2 border-purple-200">
                              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                                <CardTitle className="flex items-center gap-2">
                                  <MessageCircle className="w-5 h-5 text-purple-600" />
                                  Chat with Project Manager
                                </CardTitle>
                                <CardDescription>
                                  Send messages and get instant updates about your project
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-6">
                                {/* Chat Messages */}
                                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                                  {loadingChat ? (
                                    <div className="text-center py-8">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                      <p className="mt-2 text-sm text-gray-600">Loading messages...</p>
                                    </div>
                                  ) : chatMessages.length === 0 ? (
                                    <div className="text-center py-8">
                                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                      <p className="text-gray-600">No messages yet. Start the conversation!</p>
                                    </div>
                                  ) : (
                                    chatMessages.map((msg) => (
                                      <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                                      >
                                        <div
                                          className={`max-w-[70%] rounded-lg p-3 ${
                                            msg.sender_type === 'client'
                                              ? 'bg-purple-600 text-white'
                                              : 'bg-white border border-gray-200'
                                          }`}
                                        >
                                          <p className={`text-xs font-semibold mb-1 ${
                                            msg.sender_type === 'client' ? 'text-purple-200' : 'text-gray-600'
                                          }`}>
                                            {msg.sender_name}
                                          </p>
                                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                          <p className={`text-xs mt-1 ${
                                            msg.sender_type === 'client' ? 'text-purple-200' : 'text-gray-500'
                                          }`}>
                                            {new Date(msg.created_at).toLocaleString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                  <div ref={chatEndRef} />
                                </div>

                                {/* Chat Input */}
                                <div className="flex gap-2">
                                  <textarea
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendChatMessage();
                                      }
                                    }}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    rows="3"
                                    data-testid="chat-input"
                                  />
                                  <Button
                                    onClick={sendChatMessage}
                                    disabled={!chatMessage.trim() || sendingChat}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-auto"
                                    data-testid="send-chat-btn"
                                  >
                                    {sendingChat ? (
                                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                      <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Send
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          {/* Testimonial Tab - Only for Completed Projects */}
                          {project.status === 'completed' && (
                            <TabsContent value="testimonial" className="space-y-4">
                              <Card className="border-2 border-yellow-200">
                                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                                  <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-600" />
                                    Share Your Experience
                                  </CardTitle>
                                  <CardDescription>
                                    {testimonialData 
                                      ? 'Edit your testimonial about this project'
                                      : 'Help others by sharing your experience working with us!'}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                  {loadingTestimonial ? (
                                    <div className="text-center py-8">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                                      <p className="mt-2 text-sm text-gray-600">Loading...</p>
                                    </div>
                                  ) : (
                                    <form onSubmit={handleSubmitTestimonial} className="space-y-6">
                                      {/* Status Badge */}
                                      {testimonialData && (
                                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                          <span className="text-sm font-medium text-gray-700">Status:</span>
                                          <Badge 
                                            className={`${
                                              testimonialData.status === 'approved' 
                                                ? 'bg-green-100 text-green-800 border-green-300' 
                                                : testimonialData.status === 'rejected'
                                                ? 'bg-red-100 text-red-800 border-red-300'
                                                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                            } border`}
                                          >
                                            {testimonialData.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            {testimonialData.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                                            {testimonialData.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                            {testimonialData.status.charAt(0).toUpperCase() + testimonialData.status.slice(1)}
                                          </Badge>
                                        </div>
                                      )}

                                      {/* Your Role/Position */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                          Your Role/Position (Optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={testimonialForm.role}
                                          onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                                          placeholder="e.g., CEO, Project Manager, Marketing Director"
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                          data-testid="testimonial-role-input"
                                        />
                                      </div>

                                      {/* Rating */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                          Rating <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              type="button"
                                              onClick={() => setTestimonialForm({ ...testimonialForm, rating: star })}
                                              className="focus:outline-none transform hover:scale-110 transition-transform"
                                              data-testid={`rating-star-${star}`}
                                            >
                                              <Star
                                                className={`w-8 h-8 ${
                                                  star <= testimonialForm.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                              />
                                            </button>
                                          ))}
                                          <span className="ml-2 text-sm font-semibold text-gray-700">
                                            {testimonialForm.rating} / 5
                                          </span>
                                        </div>
                                      </div>

                                      {/* Message */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                          Your Review <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                          value={testimonialForm.message}
                                          onChange={(e) => setTestimonialForm({ ...testimonialForm, message: e.target.value })}
                                          placeholder="Share your experience working with us on this project..."
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                                          rows="6"
                                          required
                                          minLength={10}
                                          maxLength={1000}
                                          data-testid="testimonial-message-input"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                          {testimonialForm.message.length} / 1000 characters (minimum 10)
                                        </p>
                                      </div>

                                      {/* Submit Button */}
                                      <Button
                                        type="submit"
                                        disabled={loadingTestimonial || !testimonialForm.message.trim() || testimonialForm.message.length < 10}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3"
                                        data-testid="submit-testimonial-btn"
                                      >
                                        {loadingTestimonial ? (
                                          <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Submitting...
                                          </div>
                                        ) : testimonialData ? (
                                          <>
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Update Testimonial
                                          </>
                                        ) : (
                                          <>
                                            <Star className="w-5 h-5 mr-2" />
                                            Submit Testimonial
                                          </>
                                        )}
                                      </Button>

                                      {testimonialData && testimonialData.status === 'pending' && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                          <p className="text-sm text-blue-800 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Your testimonial is pending review. You can edit it anytime.
                                          </p>
                                        </div>
                                      )}

                                      {testimonialData && testimonialData.status === 'approved' && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                          <p className="text-sm text-green-800 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Your testimonial has been approved and is now visible on our website! You can still edit it if needed.
                                          </p>
                                        </div>
                                      )}

                                      {testimonialData && testimonialData.status === 'rejected' && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                          <p className="text-sm text-red-800 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Your testimonial was not approved. Please update it and submit again.
                                          </p>
                                        </div>
                                      )}
                                    </form>
                                  )}
                                </CardContent>
                              </Card>
                            </TabsContent>
                          )}
                        </Tabs>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
