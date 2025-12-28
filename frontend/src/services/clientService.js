import api from './api';

const clientService = {
  // Get all clients
  getAllClients: async () => {
    const response = await api.get('/admin/clients/');
    return response.data;
  },

  // Get single client by ID
  getClient: async (clientId) => {
    const response = await api.get(`/admin/clients/${clientId}`);
    return response.data;
  },

  // Create new client
  createClient: async (clientData) => {
    const response = await api.post('/admin/clients/', clientData);
    return response.data;
  },

  // Update client
  updateClient: async (clientId, clientData) => {
    const response = await api.put(`/admin/clients/${clientId}`, clientData);
    return response.data;
  },

  // Delete client
  deleteClient: async (clientId) => {
    const response = await api.delete(`/admin/clients/${clientId}`);
    return response.data;
  },

  // Get client projects
  getClientProjects: async (clientId) => {
    const response = await api.get(`/admin/clients/${clientId}/projects`);
    return response.data;
  },

  // Create client project
  createClientProject: async (projectData) => {
    const response = await api.post('/admin/client-projects/', projectData);
    return response.data;
  },

  // Update client project
  updateClientProject: async (projectId, projectData) => {
    const response = await api.put(`/admin/client-projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete client project
  deleteClientProject: async (projectId) => {
    const response = await api.delete(`/admin/client-projects/${projectId}`);
    return response.data;
  },

  // Get all client projects
  getAllClientProjects: async () => {
    const response = await api.get('/admin/client-projects/');
    return response.data;
  },

  // Upload file to project
  uploadProjectFile: async (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(
      `/admin/client-projects/${projectId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Delete project file
  deleteProjectFile: async (projectId, fileId) => {
    const response = await api.delete(`/admin/client-projects/${projectId}/files/${fileId}`);
    return response.data;
  },

  // ========== MILESTONES ==========
  // Add milestone to project
  addMilestone: async (projectId, milestoneData) => {
    const response = await api.post(`/admin/client-projects/${projectId}/milestones`, milestoneData);
    return response.data;
  },

  // Update milestone
  updateMilestone: async (projectId, milestoneId, milestoneData) => {
    const response = await api.put(`/admin/client-projects/${projectId}/milestones/${milestoneId}`, milestoneData);
    return response.data;
  },

  // Delete milestone
  deleteMilestone: async (projectId, milestoneId) => {
    const response = await api.delete(`/admin/client-projects/${projectId}/milestones/${milestoneId}`);
    return response.data;
  },

  // ========== TASKS ==========
  // Add task to project
  addTask: async (projectId, taskData) => {
    const response = await api.post(`/admin/client-projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  // Update task
  updateTask: async (projectId, taskId, taskData) => {
    const response = await api.put(`/admin/client-projects/${projectId}/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (projectId, taskId) => {
    const response = await api.delete(`/admin/client-projects/${projectId}/tasks/${taskId}`, taskData);
    return response.data;
  },

  // ========== COMMENTS ==========
  // Add comment to project
  addComment: async (projectId, commentData) => {
    const response = await api.post(`/admin/client-projects/${projectId}/comments`, commentData);
    return response.data;
  },

  // Delete comment
  deleteComment: async (projectId, commentId) => {
    const response = await api.delete(`/admin/client-projects/${projectId}/comments/${commentId}`);
    return response.data;
  },

  // ========== TEAM MEMBERS ==========
  // Add team member to project
  addTeamMember: async (projectId, memberData) => {
    const response = await api.post(`/admin/client-projects/${projectId}/team`, memberData);
    return response.data;
  },

  // Remove team member from project
  removeTeamMember: async (projectId, adminId) => {
    const response = await api.delete(`/admin/client-projects/${projectId}/team/${adminId}`);
    return response.data;
  },

  // ========== BUDGET ==========
  // Update project budget
  updateBudget: async (projectId, budgetData) => {
    const response = await api.put(`/admin/client-projects/${projectId}/budget`, budgetData);
    return response.data;
  },

  // ========== CHAT (ADMIN) ==========
  // Send chat message to client (Admin)
  sendAdminChatMessage: async (projectId, message) => {
    const response = await api.post(`/admin/client-projects/${projectId}/chat`, { message });
    return response.data;
  },

  // Get chat messages (Admin)
  getAdminChatMessages: async (projectId) => {
    const response = await api.get(`/admin/client-projects/${projectId}/chat`);
    return response.data;
  },

  // Get unread message count (Admin)
  getUnreadMessageCount: async (projectId) => {
    const response = await api.get(`/admin/client-projects/${projectId}/unread-count`);
    return response.data;
  },

  // ========== CHAT (CLIENT) ==========
  // Send chat message to admin (Client)
  sendClientChatMessage: async (projectId, message, token) => {
    const response = await api.post(
      `/client/projects/${projectId}/chat`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Get chat messages (Client)
  getClientChatMessages: async (projectId, token) => {
    const response = await api.get(`/client/projects/${projectId}/chat`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Add comment (Client)
  addClientComment: async (projectId, message, token) => {
    const response = await api.post(
      `/client/projects/${projectId}/comments`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Get single project (Admin)
  getProject: async (projectId) => {
    const response = await api.get(`/admin/client-projects/${projectId}`);
    return response.data;
  }
};

export default clientService;
