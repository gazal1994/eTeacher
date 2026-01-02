import axios from 'axios';

// Custom API Error class
class ApiError extends Error {
  constructor(message: string, public status?: number, public statusText?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },
};

// Projects API
export const projectsApi = {
  getAll: async (filters?: { category?: string; status?: string }) => {
    const response = await apiClient.get('/projects', { params: filters });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (projectData: any) => {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },
  
  update: async (id: string, projectData: any) => {
    const response = await apiClient.put(`/projects/${id}`, projectData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};

// Leads API
export const leadsApi = {
  create: async (leadData: {
    name: string;
    email: string;
    phone: string;
    message: string;
    projectType?: string;
  }) => {
    const response = await apiClient.post('/leads', leadData);
    return response.data;
  },
  
  getAll: async (filters?: { status?: string }) => {
    const response = await apiClient.get('/leads', { params: filters });
    return response.data;
  },
  
  update: async (id: string, updateData: { status?: string; notes?: string }) => {
    const response = await apiClient.put(`/leads/${id}`, updateData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },
};

// Upload API
export const uploadApi = {
  uploadImages: async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default apiClient;


export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Try to parse JSON response
    let data: T;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as T;
    }

    if (!response.ok) {
      // Handle specific error cases
      let errorMessage = typeof data === 'string' ? data : response.statusText;
      
      if (response.status === 409) {
        errorMessage = 'Student is already enrolled in this course.';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (response.status === 400) {
        errorMessage = typeof data === 'string' ? data : 'Invalid request data.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        response.statusText
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors
    throw new ApiError(
      'Unable to reach server. Please check your connection and try again.'
    );
  }
}
