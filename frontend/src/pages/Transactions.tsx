import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../utils/format';

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
              return;
            }
          }
        }

        // Fallback to static JSON
        const response = await fetch('/transactions.json');
        const data = await response.json();
        const sortedData = data.sort((a: Transaction, b: Transaction) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading transactions:', error);
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
  };

  const handleExport = async () => {
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
    } else {
      alert('Failed to export CSV');
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
          <a href="/" className="flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/5" 
             style={{ color: '#D1D1D1' }}>
            <span className="mr-3">📊</span>
            Dashboard
          </a>
          <a href="/transactions" className="flex items-center p-3 rounded-lg transition-colors duration-200" 
             style={{ backgroundColor: 'rgba(0, 255, 132, 0.1)', color: '#00FF84', border: '1px solid #00FF84' }}>
            <span className="mr-3">💳</span>
            Transactions
          </a>
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            onClick={() => setShowExportModal(true)}
          >
            Export CSV
          </button>
        </div>

        {/* Search and Filters */}
        <div className="rounded-xl p-6 border border-white/10 mb-6" style={{ backgroundColor: '#2F3246' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: '#D1D1D1' }}>Search</label>
              <input
                type="text"
                placeholder="Search by user, status, category, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D1D1D1' }}>Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D1D1D1' }}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D1D1D1' }}>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D1D1D1' }}>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              />
            </div>

            {/* Amount Min */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D1D1D1' }}>Min Amount</label>
              <input
                type="number"
                placeholder="0"
                value={filters.amountMin}
                onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              />
            </div>

            {/* Amount Max */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D1D1D1' }}>Max Amount</label>
              <input
                type="number"
                placeholder="10000"
                value={filters.amountMax}
                onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                Clear Filters
              </button>
              <span className="text-sm" style={{ color: '#D1D1D1' }}>
                {filteredTransactions.length} of {transactions.length} transactions
              </span>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="user_id">Sort by User</option>
                <option value="category">Sort by Category</option>
                <option value="status">Sort by Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden" style={{ backgroundColor: '#2F3246' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#1E1E2F' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#D1D1D1' }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#D1D1D1' }}>
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#D1D1D1' }}>
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#D1D1D1' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#D1D1D1' }}>
                    User ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#FFFFFF' }}>
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: transaction.category === 'Revenue' ? '#00FF84' : '#FF6B6B' }}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#FFFFFF' }}>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.category === 'Revenue' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
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
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm" style={{ color: '#D1D1D1' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-sm transition-colors duration-200 disabled:opacity-50"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                      currentPage === pageNum 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-sm transition-colors duration-200 disabled:opacity-50"
                style={{ backgroundColor: '#1E1E2F', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Export CSV</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Columns:</label>
                {allColumns.map((column) => (
                  <label key={column.key} className="flex items-center mb-2">
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
                    {column.label}
                  </label>
                ))}
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="mr-2"
                  />
                  Include Headers
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Export
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