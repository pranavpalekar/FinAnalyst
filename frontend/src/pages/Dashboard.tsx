import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/format';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}

type ChartType = 'trends' | 'growth' | 'breakdown' | 'margins' | 'volume';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<ChartType>('trends');

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

  // Calculate financial metrics
  const totalRevenue = transactions
    .filter(t => t.category === 'Revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.category === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalRevenue - totalExpense;
  const profitMargin = totalRevenue > 0 ? ((balance / totalRevenue) * 100) : 0;

  // Generate monthly data for all charts
  const generateMonthlyData = () => {
    const monthlyData: { [key: string]: { 
      revenue: number; 
      expenses: number; 
      profit: number;
      volume: number;
    }} = {};
    
    const currentYear = new Date().getFullYear();
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${currentYear}-${String(month).padStart(2, '0')}`;
      monthlyData[monthKey] = { revenue: 0, expenses: 0, profit: 0, volume: 0 };
    }
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expenses: 0, profit: 0, volume: 0 };
      }
      
      if (transaction.category === 'Revenue') {
        monthlyData[monthKey].revenue += transaction.amount;
      } else if (transaction.category === 'Expense') {
        monthlyData[monthKey].expenses += transaction.amount;
      }
      monthlyData[monthKey].volume += 1;
    });

    // Calculate profit for each month
    Object.keys(monthlyData).forEach(month => {
      monthlyData[month].profit = monthlyData[month].revenue - monthlyData[month].expenses;
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.profit,
        volume: data.volume
      }))
      .sort((a, b) => new Date(a.month + ' 1, 2024').getTime() - new Date(b.month + ' 1, 2024').getTime());
  };

  const monthlyData = generateMonthlyData();

  // Generate month-over-month growth data
  const generateGrowthData = () => {
    return monthlyData.map((data, index) => {
      if (index === 0) {
        return {
          month: data.month,
          revenueGrowth: 0,
          expenseGrowth: 0,
          profitGrowth: 0
        };
      }
      
      const prevMonth = monthlyData[index - 1];
      const revenueGrowth = prevMonth.revenue > 0 ? ((data.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0;
      const expenseGrowth = prevMonth.expenses > 0 ? ((data.expenses - prevMonth.expenses) / prevMonth.expenses) * 100 : 0;
      const profitGrowth = prevMonth.profit !== 0 ? ((data.profit - prevMonth.profit) / Math.abs(prevMonth.profit)) * 100 : 0;
      
      return {
        month: data.month,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        expenseGrowth: Math.round(expenseGrowth * 100) / 100,
        profitGrowth: Math.round(profitGrowth * 100) / 100
      };
    });
  };

  const growthData = generateGrowthData();

  // Generate category breakdown data
  const generateCategoryData = () => {
    const revenueByUser = transactions
      .filter(t => t.category === 'Revenue')
      .reduce((acc, t) => {
        acc[t.user_id] = (acc[t.user_id] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    const expenseByUser = transactions
      .filter(t => t.category === 'Expense')
      .reduce((acc, t) => {
        acc[t.user_id] = (acc[t.user_id] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    return [
      ...Object.entries(revenueByUser).map(([user, amount]) => ({
        name: `${user} (Revenue)`,
        value: amount,
        type: 'Revenue'
      })),
      ...Object.entries(expenseByUser).map(([user, amount]) => ({
        name: `${user} (Expense)`,
        value: amount,
        type: 'Expense'
      }))
    ];
  };

  const categoryData = generateCategoryData();

  // Generate profit margin data
  const generateMarginData = () => {
    return monthlyData.map(data => ({
      month: data.month,
      profitMargin: data.revenue > 0 ? ((data.profit / data.revenue) * 100) : 0,
      revenue: data.revenue,
      expenses: data.expenses
    }));
  };

  const marginData = generateMarginData();

  // Chart colors
  const COLORS = ['#00FF84', '#FFC043', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2A2D3E' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#00FF84' }}></div>
      </div>
    );
  }

  const renderChart = () => {
    switch (activeChart) {
      case 'trends':
        return (
          <div className="rounded-xl p-6 border border-white/10 shadow-lg" style={{ backgroundColor: '#2F3246' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">Monthly Revenue vs Expenses Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" />
                <XAxis dataKey="month" stroke="#D1D1D1" />
                <YAxis stroke="#D1D1D1" />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#2F3246', 
                    border: '1px solid #4A4A4A',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#00FF84" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#FFC043" strokeWidth={3} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'growth':
        return (
          <div className="rounded-xl p-6 border border-white/10 shadow-lg" style={{ backgroundColor: '#2F3246' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">Month-over-Month Growth Rate (%)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" />
                <XAxis dataKey="month" stroke="#D1D1D1" />
                <YAxis stroke="#D1D1D1" />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, '']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#2F3246', 
                    border: '1px solid #4A4A4A',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                />
                <Bar dataKey="revenueGrowth" fill="#00FF84" name="Revenue Growth" />
                <Bar dataKey="expenseGrowth" fill="#FFC043" name="Expense Growth" />
                <Bar dataKey="profitGrowth" fill="#4ECDC4" name="Profit Growth" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'breakdown':
        return (
          <div className="rounded-xl p-6 border border-white/10 shadow-lg" style={{ backgroundColor: '#2F3246' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">Revenue & Expense Breakdown by User</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ 
                    backgroundColor: '#2F3246', 
                    border: '1px solid #4A4A4A',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'margins':
        return (
          <div className="rounded-xl p-6 border border-white/10 shadow-lg" style={{ backgroundColor: '#2F3246' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">Profit Margin Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={marginData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" />
                <XAxis dataKey="month" stroke="#D1D1D1" />
                <YAxis stroke="#D1D1D1" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'profitMargin' ? `${value.toFixed(1)}%` : formatCurrency(value),
                    name === 'profitMargin' ? 'Profit Margin' : name
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#2F3246', 
                    border: '1px solid #4A4A4A',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                />
                <Area type="monotone" dataKey="profitMargin" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'volume':
        return (
          <div className="rounded-xl p-6 border border-white/10 shadow-lg" style={{ backgroundColor: '#2F3246' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">Transaction Volume by Month</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" />
                <XAxis dataKey="month" stroke="#D1D1D1" />
                <YAxis stroke="#D1D1D1" />
                <Tooltip 
                  formatter={(value: number) => [value, 'Transactions']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#2F3246', 
                    border: '1px solid #4A4A4A',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                />
                <Bar dataKey="volume" fill="#45B7D1" name="Transaction Volume" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#2A2D3E' }}>
      {/* Left Sidebar Navigation */}
      <div className="w-64 p-4" style={{ backgroundColor: '#1E1E2F' }}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold" style={{ color: '#00FF84' }}>Finanalyst</h2>
        </div>
        
        <nav className="space-y-2">
          <Link to="/" className="flex items-center p-3 rounded-lg transition-colors duration-200" 
             style={{ backgroundColor: 'rgba(0, 255, 132, 0.1)', color: '#00FF84', border: '1px solid #00FF84' }}>
            <span className="mr-3">📊</span>
            Dashboard
          </Link>
          <Link to="/transactions" className="flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/5" 
             style={{ color: '#D1D1D1' }}>
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
            <h1 className="text-3xl font-bold text-white mb-2">Financial Dashboard</h1>
            <p className="text-gray-400">Welcome back, Pranav Palekar</p>
          </div>
            
            {/* User Profile Avatar */}
            <div className="flex items-center space-x-2">
              <img
                src="https://thispersondoesnotexist.com/"
                alt="User Profile"
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: '#00FF84' }}
              />
            <span style={{ color: '#FFFFFF' }}>Pranav Palekar</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 border border-white/10" style={{ backgroundColor: '#2F3246' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#D1D1D1' }}>Total Revenue</p>
                <p className="text-2xl font-bold" style={{ color: '#00FF84' }}>{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(0, 255, 132, 0.1)' }}>
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 border border-white/10" style={{ backgroundColor: '#2F3246' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#D1D1D1' }}>Total Expenses</p>
                <p className="text-2xl font-bold" style={{ color: '#FF6B6B' }}>{formatCurrency(totalExpense)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}>
                <span className="text-2xl">💸</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 border border-white/10" style={{ backgroundColor: '#2F3246' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#D1D1D1' }}>Net Balance</p>
                <p className="text-2xl font-bold" style={{ color: balance >= 0 ? '#00FF84' : '#FF6B6B' }}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(78, 205, 196, 0.1)' }}>
                <span className="text-2xl">⚖️</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 border border-white/10" style={{ backgroundColor: '#2F3246' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#D1D1D1' }}>Profit Margin</p>
                <p className="text-2xl font-bold" style={{ color: profitMargin >= 0 ? '#00FF84' : '#FF6B6B' }}>
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(69, 183, 209, 0.1)' }}>
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveChart('trends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeChart === 'trends'
                  ? 'text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeChart === 'trends' ? 'rgba(0, 255, 132, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: activeChart === 'trends' ? '1px solid #00FF84' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              📊 Revenue vs Expenses
            </button>
            <button
              onClick={() => setActiveChart('growth')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeChart === 'growth'
                  ? 'text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeChart === 'growth' ? 'rgba(0, 255, 132, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: activeChart === 'growth' ? '1px solid #00FF84' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              📈 Growth Rates
            </button>
            <button
              onClick={() => setActiveChart('breakdown')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeChart === 'breakdown'
                  ? 'text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeChart === 'breakdown' ? 'rgba(0, 255, 132, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: activeChart === 'breakdown' ? '1px solid #00FF84' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              🥧 Category Breakdown
            </button>
            <button
              onClick={() => setActiveChart('margins')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeChart === 'margins'
                  ? 'text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeChart === 'margins' ? 'rgba(0, 255, 132, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: activeChart === 'margins' ? '1px solid #00FF84' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              💹 Profit Margins
            </button>
            <button
              onClick={() => setActiveChart('volume')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeChart === 'volume'
                  ? 'text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeChart === 'volume' ? 'rgba(0, 255, 132, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: activeChart === 'volume' ? '1px solid #00FF84' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              📊 Transaction Volume
            </button>
          </div>
        </div>

        {/* Chart Display */}
        <div className="mb-8">
          {renderChart()}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-white/10 overflow-hidden" style={{ backgroundColor: '#2F3246' }}>
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          </div>
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
                {transactions.slice(0, 5).map((transaction) => (
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
      </div>
    </div>
  );
};

export default Dashboard; 