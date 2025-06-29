import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

// Get all transactions with filtering, sorting, and pagination
export const getTransactions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.user_id as string;

  const {
    page = 1,
    limit = 10,
    sortBy = 'date',
    sortOrder = 'desc',
    category,
    status,
    dateFrom,
    dateTo,
    amountMin,
    amountMax
  } = req.query;

  // Build filter object
  const filter: any = {};
  if (userId) {
    filter.user_id = userId;
  }
  
  if (category) {
    filter.category = Array.isArray(category) ? { $in: category } : category;
  }
  
  if (status) {
    filter.status = Array.isArray(status) ? { $in: status } : status;
  }
  
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom as string);
    if (dateTo) filter.date.$lte = new Date(dateTo as string);
  }
  
  if (amountMin || amountMax) {
    filter.amount = {};
    if (amountMin) filter.amount.$gte = Number(amountMin);
    if (amountMax) filter.amount.$lte = Number(amountMax);
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Execute query
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Transaction.countDocuments(filter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = Number(page) < totalPages;
  const hasPrevPage = Number(page) > 1;

  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }
  });
});

// Get single transaction
export const getTransaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.user_id as string || 'user_001';
  const { id } = req.params;

  const transaction = await Transaction.findOne({ id: Number(id), user_id: userId });
  
  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// Create new transaction
export const createTransaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const transactionData = { ...req.body, userId };

  const transaction = await Transaction.create(transactionData);

  res.status(201).json({
    success: true,
    data: transaction
  });
});

// Update transaction
export const updateTransaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// Delete transaction
export const deleteTransaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully'
  });
});

// Get transaction statistics
export const getTransactionStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.user_id as string;

  const filter: any = {};
  if (userId) {
    filter.user_id = userId;
  }

  const stats = await Transaction.getStats(userId);
  const revenueBreakdown = await Transaction.getCategoryBreakdown(userId, 'Revenue');
  const expenseBreakdown = await Transaction.getCategoryBreakdown(userId, 'Expense');

  res.status(200).json({
    success: true,
    data: {
      stats,
      revenueBreakdown,
      expenseBreakdown
    }
  });
});

// Get available filters
export const getAvailableFilters = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.user_id as string;

  const filter: any = {};
  if (userId) {
    filter.user_id = userId;
  }

  const [categories, statuses] = await Promise.all([
    Transaction.distinct('category', filter),
    Transaction.distinct('status', filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      categories,
      statuses
    }
  });
});

// Get dashboard overview
export const getDashboardOverview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.user_id as string; // Remove default to show all users

  // Build filter object - only filter by user_id if specifically provided
  const filter: any = {};
  if (userId) {
    filter.user_id = userId;
  }

  const stats = await Transaction.getStats(userId);
  
  // Get recent transactions
  const recentTransactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .limit(5)
    .lean();

  // Get monthly trends for chart
  const monthlyTrends = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          category: '$category'
        },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats,
      recentTransactions,
      monthlyTrends
    }
  });
});

// Get CSV export configuration options
export const getCSVConfigOptions = catchAsync(async (req: Request, res: Response) => {
  const availableColumns = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'amount', label: 'Amount', type: 'number' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'status', label: 'Status', type: 'string' },
    { key: 'user_id', label: 'User ID', type: 'string' }
  ];

  res.status(200).json({
    success: true,
    data: {
      availableColumns,
      defaultConfig: {
        columns: ['date', 'amount', 'category', 'status'],
        dateFormat: 'US',
        includeHeaders: true,
        delimiter: ','
      }
    }
  });
});

// Export transactions to CSV
export const exportToCSV = catchAsync(async (req: Request, res: Response) => {
  const { config, filters } = req.body;
  const { columns, includeHeaders } = config;

  // Build filter object - apply the same filters as the frontend
  const filter: any = {};
  
  // Category filter
  if (filters?.category && filters.category !== '') {
    filter.category = filters.category;
  }
  
  // Status filter
  if (filters?.status && filters.status !== '') {
    filter.status = filters.status;
  }
  
  // Date range filter
  if (filters?.dateFrom || filters?.dateTo) {
    filter.date = {};
    if (filters.dateFrom) {
      filter.date.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      // Set end of day for dateTo
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filter.date.$lte = endDate;
    }
  }
  
  // Amount range filter
  if (filters?.amountMin || filters?.amountMax) {
    filter.amount = {};
    if (filters.amountMin && filters.amountMin !== '') {
      filter.amount.$gte = Number(filters.amountMin);
    }
    if (filters.amountMax && filters.amountMax !== '') {
      filter.amount.$lte = Number(filters.amountMax);
    }
  }

  // Get all transactions first (we'll filter by search term in memory)
  let transactions = await Transaction.find(filter).lean();

  // Apply search term filter (if provided)
  if (filters?.searchTerm && filters.searchTerm.trim() !== '') {
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    transactions = transactions.filter(transaction => {
      const searchableFields = [
        transaction.user_id,
        transaction.status,
        transaction.category,
        transaction.amount.toString()
      ];
      
      return searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Generate CSV
  const csv = generateCSV(transactions, columns);

  // Set response headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
  
  res.send(csv);
});

// Helper function to generate CSV
function generateCSV(transactions: any[], columns: string[]): string {
  const headers = columns.map(col => col.toString());
  const rows = transactions.map(transaction => 
    columns.map(col => {
      const value = transaction[col];
      if (col === 'date') {
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      if (col === 'amount') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
      return value;
    })
  );

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
} 