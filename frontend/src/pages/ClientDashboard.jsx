import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { LogOut, Download, Calendar, FileText, Briefcase, TrendingUp, Clock, CheckCircle2, AlertCircle, Sparkles, Users, Building2, Star, MessageSquare, Send } from 'lucide-react';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [myTestimonials, setMyTestimonials] = useState([]);
  const [testimonialForm, setTestimonialForm] = useState({
    role: '',
    message: '',
    rating: 5
  });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('client_token');
    const clientData = localStorage.getItem('client_data');

    if (!token || !clientData) {
      navigate('/client/login');
      return;
    }

    setClient(JSON.parse(clientData));
    fetchProjects(token);
    fetchMyTestimonials(token);
  }, [navigate]);

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

  const fetchMyTestimonials = async (token) => {
    try {
      const response = await api.get('/testimonials/client/my-testimonials', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMyTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    
    if (!testimonialForm.message.trim() || testimonialForm.message.length < 10) {
      toast.error('Please write at least 10 characters for your testimonial');
      return;
    }

    setSubmittingTestimonial(true);
    const token = localStorage.getItem('client_token');

    try {
      await api.post('/testimonials/client/submit', testimonialForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('✅ Testimonial submitted successfully! It will be reviewed by admin.');
      setTestimonialForm({ role: '', message: '', rating: 5 });
      setShowTestimonialForm(false);
      fetchMyTestimonials(token);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast.error('Failed to submit testimonial. Please try again.');
    } finally {
      setSubmittingTestimonial(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-purple-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Loading your projects...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch your data</p>
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
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
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
                  className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 bg-white transform hover:-translate-y-1"
                  onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                  data-testid={`project-card-${project.id}`}
                >
                  <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-purple-50">
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
                      <div className="relative">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(project.progress)} transition-all duration-500 rounded-full`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Expected Delivery */}
                    {project.expected_delivery && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Expected Delivery:</span>
                        <span className="font-semibold text-blue-700">{new Date(project.expected_delivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}

                    {/* Expanded View */}
                    {selectedProject?.id === project.id && (
                      <div className="mt-6 pt-6 border-t-2 border-purple-100 space-y-6 animate-in slide-in-from-top duration-300">
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

                        {/* Help Section */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">💡 Tip:</span> Click the Download button to save project files to your device. If you have any questions about this project, please contact your project manager.
                          </p>
                        </div>
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
