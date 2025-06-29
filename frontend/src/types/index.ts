export interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
}

export interface CategoryBreakdown {
  _id: string;
  count: number;
  total: number;
  avg: number;
}

export interface DashboardData {
  stats: TransactionStats;
  recentTransactions: Transaction[];
  monthlyTrends: any[];
}

export interface FilterOptions {
  categories: string[];
  statuses: string[];
}

export interface TransactionFilters {
  category?: string | string[];
  status?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: PaginationInfo;
  };
}

export interface StatsResponse {
  success: boolean;
  data: {
    stats: TransactionStats;
    revenueBreakdown: CategoryBreakdown[];
    expenseBreakdown: CategoryBreakdown[];
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export interface CSVConfig {
  columns: string[];
  dateFormat: string;
  includeHeaders: boolean;
  delimiter: string;
}

export interface CSVColumn {
  key: string;
  label: string;
  type: string;
}

export interface CSVConfigResponse {
  success: boolean;
  data: {
    availableColumns: CSVColumn[];
    defaultConfig: CSVConfig;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
} 