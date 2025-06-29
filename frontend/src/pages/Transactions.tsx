import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/format';
import ErrorAlert, { AlertType } from '../components/ErrorAlert';
import toast from 'react-hot-toast';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportColumns, setExportColumns] = useState<string[]>(['date', 'amount', 'category', 'status']);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  
  // Error handling states
  const [error, setError] = useState<{ type: AlertType; title: string; message: string } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  
  const allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'user_id', label: 'User ID' },
  ];

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        
        if (token) {
          const response = await fetch('http://localhost:5000/api/transactions?limit=1000', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data.transactions) {
              const sortedData = result.data.transactions.sort((a: Transaction, b: Transaction) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              setTransactions(sortedData);
              setLoading(false);
              toast.success('Transactions loaded successfully');
              return;
            }
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        // Fallback to static JSON
        const response = await fetch('/transactions.json');
        if (!response.ok) {
          throw new Error('Failed to load transactions data');
        }
        const data = await response.json();
        const sortedData = data.sort((a: Transaction, b: Transaction) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedData);
        setLoading(false);
        toast.success('Transactions loaded from local data');
      } catch (error) {
        console.error('Error loading transactions:', error);
        setError({
          type: 'error',
          title: 'Failed to Load Transactions',
          message: error instanceof Error ? error.message : 'An unexpected error occurred while loading transactions.'
        });
        toast.error('Failed to load transactions');
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const searchMatch = 
      transaction.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm);

    const categoryMatch = !filters.category || transaction.category === filters.category;
    const statusMatch = !filters.status || transaction.status === filters.status;
    
    const transactionDate = new Date(transaction.date);
    const dateFromMatch = !filters.dateFrom || transactionDate >= new Date(filters.dateFrom);
    const dateToMatch = !filters.dateTo || transactionDate <= new Date(filters.dateTo);
    
    const amountMinMatch = !filters.amountMin || transaction.amount >= Number(filters.amountMin);
    const amountMaxMatch = !filters.amountMax || transaction.amount <= Number(filters.amountMax);

    return searchMatch && categoryMatch && statusMatch && dateFromMatch && dateToMatch && amountMinMatch && amountMaxMatch;
  });

  // Sort filtered transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue: any, bValue: any;
    switch (sortBy) {
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'user_id':
        aValue = a.user_id;
        bValue = b.user_id;
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'date':
      default:
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique categories and statuses for filter options
  const categories = [...new Set(transactions.map(t => t.category))];
  const statuses = [...new Set(transactions.map(t => t.status))];

  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
    toast.success('Filters cleared');
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const config = {
        columns: exportColumns,
        includeHeaders,
      };
      const exportFilters = { 
        ...filters,
        searchTerm: searchTerm // Include search term in export filters
      };
      
      const response = await fetch('http://localhost:5000/api/transactions/export-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, filters: exportFilters }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setShowExportModal(false);
        toast.success('CSV exported successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError({
        type: 'error',
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Failed to export CSV file. Please try again.'
      });
      toast.error('Failed to export CSV');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2A2D3E' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#00FF84' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#2A2D3E' }}>
      {/* Left Sidebar Navigation */}
      <div className="w-64 p-4" style={{ backgroundColor: '#1E1E2F' }}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold" style={{ color: '#00FF84' }}>Finanalyst</h2>
        </div>
        
        <nav className="space-y-2">
          <Link to="/" className="flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/5" 
             style={{ color: '#D1D1D1' }}>
            <span className="mr-3">📊</span>
            Dashboard
          </Link>
          <Link to="/transactions" className="flex items-center p-3 rounded-lg transition-colors duration-200" 
             style={{ backgroundColor: 'rgba(0, 255, 132, 0.1)', color: '#00FF84', border: '1px solid #00FF84' }}>
            <span className="mr-3">💳</span>
            Transactions
          </Link>
          <a href="#" className="flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/5" 
             style={{ color: '#D1D1D1' }}>
            <span className="mr-3">💰</span>
            Wallet
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/5" 
             style={{ color: '#D1D1D1' }}>
            <span className="mr-3">📈</span>
            Analytics
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/5" 
             style={{ color: '#D1D1D1' }}>
            <span className="mr-3">👤</span>
            Personal
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/5" 
             style={{ color: '#D1D1D1' }}>
            <span className="mr-3">💬</span>
            Message
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/5" 
             style={{ color: '#D1D1D1' }}>
            <span className="mr-3">⚙️</span>
            Setting
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
            <p className="text-gray-400">Manage and analyze your financial transactions</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert
            type={error.type}
            title={error.title}
            message={error.message}
            onClose={() => setError(null)}
          />
        )}

        {/* Success Message for Data Load */}
        {!error && transactions.length > 0 && (
          <ErrorAlert
            type="success"
            title="Data Loaded Successfully"
            message={`${transactions.length} transactions loaded. Showing ${paginatedTransactions.length} of ${filteredTransactions.length} filtered results.`}
            onClose={() => {}}
            show={false} // Hidden by default, can be shown if needed
          />
        )}

        {/* Search and Filters */}
        <div className="rounded-xl border border-white/10 p-6 mb-6" style={{ backgroundColor: '#2F3246' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Search</label>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-green-500"
                style={{ backgroundColor: '#2F3246' }}
              >
                <option value="" style={{ backgroundColor: '#2F3246', color: '#FFFFFF' }}>All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category} style={{ backgroundColor: '#2F3246', color: '#FFFFFF' }}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-green-500"
                style={{ backgroundColor: '#2F3246' }}
              >
                <option value="" style={{ backgroundColor: '#2F3246', color: '#FFFFFF' }}>All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status} style={{ backgroundColor: '#2F3246', color: '#FFFFFF' }}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-green-500"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Min Amount</label>
              <input
                type="number"
                placeholder="Min amount"
                value={filters.amountMin}
                onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Max Amount</label>
              <input
                type="number"
                placeholder="Max amount"
                value={filters.amountMax}
                onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors duration-200"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 rounded-lg text-white transition-colors duration-200"
                style={{ backgroundColor: '#00FF84', color: '#000' }}
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-gray-400">
            Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden" style={{ backgroundColor: '#2F3246' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#1E1E2F' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                      style={{ color: '#D1D1D1' }}
                      onClick={() => {
                        setSortBy('date');
                        setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}>
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                      style={{ color: '#D1D1D1' }}
                      onClick={() => {
                        setSortBy('amount');
                        setSortOrder(sortBy === 'amount' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}>
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                      style={{ color: '#D1D1D1' }}
                      onClick={() => {
                        setSortBy('category');
                        setSortOrder(sortBy === 'category' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}>
                    Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                      style={{ color: '#D1D1D1' }}
                      onClick={() => {
                        setSortBy('status');
                        setSortOrder(sortBy === 'status' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}>
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                      style={{ color: '#D1D1D1' }}
                      onClick={() => {
                        setSortBy('user_id');
                        setSortOrder(sortBy === 'user_id' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}>
                    User ID {sortBy === 'user_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#FFFFFF' }}>
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: transaction.category === 'Revenue' ? '#00FF84' : '#FFC043' }}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#FFFFFF' }}>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.category === 'Revenue' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#FFFFFF' }}>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'Paid' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#FFFFFF' }}>
                      {transaction.user_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded-xl p-6 max-w-md w-full mx-4" style={{ backgroundColor: '#2F3246' }}>
              <h3 className="text-lg font-semibold text-white mb-4">Export CSV</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Select Columns</label>
                <div className="space-y-2">
                  {allColumns.map(column => (
                    <label key={column.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportColumns.includes(column.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportColumns([...exportColumns, column.key]);
                          } else {
                            setExportColumns(exportColumns.filter(col => col !== column.key));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-white">{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-white">Include Headers</span>
                </label>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exportLoading || exportColumns.length === 0}
                  className="flex-1 px-4 py-2 rounded-lg text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#00FF84', color: '#000' }}
                >
                  {exportLoading ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 