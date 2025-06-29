import axios from 'axios';
import { 
  TransactionsResponse, 
  StatsResponse, 
  DashboardResponse, 
  FilterOptions,
  CSVConfigResponse,
  TransactionFilters,
  CSVConfig
} from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const transactionAPI = {
  // Get all transactions with filters and pagination
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    category?: string | string[];
    status?: string | string[];
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
  }): Promise<TransactionsResponse> => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // Get transaction statistics
  getStats: async (): Promise<StatsResponse> => {
    const response = await api.get('/transactions/stats');
    return response.data;
  },

  // Get dashboard overview
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await api.get('/transactions/dashboard');
    return response.data;
  },

  // Get available filters
  getFilters: async (): Promise<FilterOptions> => {
    const response = await api.get('/transactions/filters');
    return response.data.data;
  },

  // Get single transaction
  getTransaction: async (id: number): Promise<any> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Get CSV configuration options
  getCSVConfig: async (): Promise<CSVConfigResponse> => {
    const response = await api.get('/transactions/csv-config');
    return response.data;
  },

  // Export to CSV
  exportToCSV: async (config: CSVConfig, filters?: TransactionFilters, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<Blob> => {
    const response = await api.post('/transactions/export-csv', {
      config,
      filters,
      sortBy,
      sortOrder
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export const authAPI = {
  // Mock login for demo purposes
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    // For demo, accept any email/password
    const mockUser = {
      id: 'user_001',
      email,
      name: 'Demo User'
    };
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    return {
      token: mockToken,
      user: mockUser
    };
  },

  // Mock logout
  logout: async (): Promise<void> => {
    // In a real app, you might call a logout endpoint
    return Promise.resolve();
  }
};

export default api; 