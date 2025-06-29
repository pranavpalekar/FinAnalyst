# 🚀 FinAnalyst - Financial Analytics Dashboard

A full-stack financial application with dynamic data visualization, advanced filtering, and configurable CSV export functionality.

## 📋 Assignment Requirements Completed

### ✅ Core Features Implemented

1. **Authentication & Security**
   - JWT-based login/logout system
   - Secure API endpoints with token validation
   - User registration and authentication

2. **Financial Dashboard**
   - Visualizations: Revenue vs expenses trends, category breakdowns, summary metrics
   - Transaction Table: Paginated display with responsive design
   - Filtering: Multi-field filters (Date, Amount, Category, Status, User)
   - Sorting: Column-based sorting with visual indicators
   - Search: Real-time search across transaction fields

3. **CSV Export System**
   - Column Configuration: User selects which fields to export
   - Auto-download: Automatic file download when ready
   - Configurable date formats and delimiters
   - **Proper CSV formatting with headers** ✅

4. **Error Handling**
   - **Alert chips for error notifications** ✅
   - Comprehensive error handling throughout the application
   - User-friendly error messages
   - Toast notifications for success/error states

## 🛠️ Technical Stack

### Frontend
- **Framework**: React.js with TypeScript
- **State Management**: React Query for server state
- **Charts**: Recharts for data visualization
- **UI Library**: Custom design system with Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast + Custom Error Alert Components

### Backend
- **Server**: Node.js with Express and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Processing**: Custom CSV generation with headers
- **Validation**: Express-validator

## 📁 Project Structure

```
FinAnalyst/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Database & app configuration
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   └── ErrorAlert.tsx  # Error handling alert chips
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── constants/       # Application constants
│   │   └── types/           # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── Finanalyst_API_Postman_Collection.json  # API documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FinAnalyst
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finanalyst
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Seed sample data
npm run seed
```

### 5. Start Backend Server
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### 6. Frontend Setup
```bash
cd frontend
npm install
```

### 7. Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3001`

## 🔐 Authentication

### Demo User Credentials
- **Email**: `demo@finanalyst.com`
- **Password**: `demo123`

### JWT Token Flow
1. User logs in with email/password
2. Server validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. Token is automatically included in API requests
5. Server validates token on protected routes

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Transactions
- `GET /api/transactions` - Get transactions with filtering, sorting, pagination
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/export-csv` - Export to CSV with headers

### Analytics
- `GET /api/analytics/summary` - Financial summary
- `GET /api/analytics/trends` - Monthly trends
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/growth` - Growth rates

### Health
- `GET /health` - Health check
- `GET /api/status` - API status

## 🎨 Features

### Interactive Dashboard
- **Real-time Metrics**: Total revenue, expenses, net balance, profit margin
- **Trend Analysis**: Revenue vs expenses over time with multiple chart types
- **Category Breakdown**: Visual representation of spending patterns
- **Recent Activity**: Latest transactions with quick actions

### Advanced Transaction Management
- **Multi-field Filtering**: Filter by date range, amount, category, status, type
- **Real-time Search**: Search across user_id, status, category, amount
- **Column Sorting**: Sort by any column with visual indicators
- **Pagination**: Efficient data loading with configurable page sizes

### CSV Export System with Headers
- **Column Selection**: Choose which fields to include in export
- **Header Configuration**: Include/exclude CSV headers
- **Filter Integration**: Export filtered data only
- **Auto-download**: Automatic file download when ready
- **Proper Formatting**: Currency formatting, date formatting, proper escaping

### Error Handling via Alert Chips
- **Error Alert Component**: Custom ErrorAlert component with different types
- **Toast Notifications**: React Hot Toast for success/error messages
- **Form Validation**: Real-time input validation with error display
- **Network Error Handling**: Graceful handling of API failures
- **Authentication Errors**: Automatic logout on token expiration

## 📱 User Flow

1. **Authentication**: User logs in with JWT authentication
2. **Dashboard Access**: View financial analytics with charts and transaction tables
3. **Data Interaction**: Filter, search, and sort transactions dynamically
4. **Report Generation**: Configure columns and export CSV reports with headers
5. **File Download**: Download file directly once the report is generated

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server with nodemon
npm run build        # Build for production
npm run seed         # Seed sample data
npm test             # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database Operations
```bash
# Seed sample data
npm run seed

# Clear all data
npm run clear-data

# Reset database
npm run reset-db
```

## 📊 Sample Data

The application includes comprehensive sample data:
- **Revenue Transactions**: Various income sources
- **Expense Transactions**: Multiple expense categories
- **Multiple Categories**: Revenue and Expense categories
- **Realistic Amounts**: Varied transaction amounts and frequencies
- **Date Range**: Historical data across multiple months

## 🎯 Key Features

### Financial Analytics
- **Revenue vs Expenses Trends**: Visual comparison over time
- **Category Breakdown**: Pie charts and bar charts
- **Summary Metrics**: Key performance indicators
- **Period Comparison**: Current vs previous period analysis

### Transaction Management
- **CRUD Operations**: Full create, read, update, delete functionality
- **Advanced Filtering**: Multiple filter criteria
- **Real-time Search**: Instant search results
- **Bulk Operations**: Mass transaction operations

### Export Functionality with Headers
- **Configurable Columns**: Select fields to export
- **Header Options**: Include/exclude CSV headers
- **Filtered Exports**: Export only filtered data
- **Auto-download**: Seamless file download experience
- **Proper Formatting**: Currency, dates, and text properly formatted

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting for abuse prevention
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: HTTP security headers

## 📈 Performance Optimizations

- **Database Indexing**: Optimized MongoDB queries
- **Pagination**: Efficient data loading
- **Caching**: React Query for client-side caching
- **Compression**: Response compression
- **Lazy Loading**: Component and route lazy loading

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Frontend Testing
```bash
cd frontend
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
```

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Environment Variables
Set the following environment variables for production:
- `NODE_ENV=production`
- `MONGODB_URI=your-production-mongodb-uri`
- `JWT_SECRET=your-production-jwt-secret`
- `FRONTEND_URL=your-production-frontend-url`

## 📝 API Documentation

### Request/Response Examples

#### Login Request
```json
POST /api/auth/login
{
  "email": "demo@finanalyst.com",
  "password": "demo123"
}
```

#### Login Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "demo@finanalyst.com",
      "name": "Pranav Palekar"
    },
    "token": "jwt-token-here"
  }
}
```

#### Get Transactions Request
```json
GET /api/transactions?page=1&limit=10&sortBy=date&sortOrder=desc&category=Revenue
```

#### CSV Export Request with Headers
```json
POST /api/transactions/export-csv
{
  "config": {
    "columns": ["date", "amount", "category", "status"],
    "includeHeaders": true
  },
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-03-31",
    "category": "Revenue"
  }
}
```

#### CSV Export Response (with headers)
```csv
"Date","Amount","Category","Status"
"Jan 15, 2024","$1,500.00","Revenue","Paid"
"Jan 20, 2024","$2,300.00","Revenue","Paid"
"Feb 01, 2024","$800.00","Expense","Pending"
```

## 🚨 Error Handling Examples

### Frontend Error Alert Component
```tsx
<ErrorAlert
  type="error"
  title="Export Failed"
  message="Failed to export CSV file. Please try again."
  onClose={() => setError(null)}
/>
```

### Backend Error Response
```json
{
  "success": false,
  "error": "Invalid date format provided",
  "statusCode": 400
}
```

### Toast Notifications
- **Success**: "Transactions loaded successfully"
- **Error**: "Failed to load transactions"
- **Warning**: "No data found for selected filters"
- **Info**: "Export completed successfully"

## 📊 Postman Collection

A comprehensive Postman collection is included for testing all API endpoints:

### How to Use the Postman Collection:

1. **Import the Collection**
   - Open Postman
   - Click "Import" button
   - Select the `Finanalyst_API_Postman_Collection.json` file

2. **Set Up Environment Variables**
   - The collection uses variables for `baseUrl` and `authToken`
   - `baseUrl` defaults to `http://localhost:5000`
   - `authToken` will be automatically set after login

3. **Authentication Flow**
   - Start with the "User Login" request
   - Use demo credentials: `demo@finanalyst.com` / `demo123`
   - The token will be automatically saved to the `authToken` variable
   - All subsequent requests will use this token

4. **Testing Endpoints**
   - The collection is organized into folders: Authentication, Transactions, Analytics, Health
   - Each request includes example data and descriptions
   - Use the "Get All Transactions" request to see the data structure
   - Test filtering with the "Get Transactions with Filters" request
   - Test CSV export with "Export Transactions to CSV" request

### Demo Credentials
- **Email**: `demo@finanalyst.com`
- **Password**: `demo123`

## 📈 Dashboard Features

### Charts Available
1. **Revenue vs Expenses Trend** - Monthly line chart
2. **Growth Rates** - Month-over-month percentage changes
3. **Category Breakdown** - Pie chart by user/category
4. **Profit Margins** - Area chart showing profit trends
5. **Transaction Volume** - Bar chart of transaction counts

### Filtering Options
- **Search**: Text search across transaction data
- **Date Range**: Filter by start and end dates
- **Category**: Filter by Revenue or Expense
- **Pagination**: Page-based navigation

### Export Features
- **CSV Export**: Download filtered data as CSV
- **Respects Filters**: Export includes all applied filters
- **Formatted Data**: Proper currency and date formatting
- **Header Configuration**: Include/exclude CSV headers

## 🎨 UI/UX Features

### Dark Theme Design
- **Primary Color**: Neon Green (#00FF84)
- **Secondary Color**: Yellow-Orange (#FFC043)
- **Background**: Dark charcoal (#2A2D3E)
- **Cards**: Slightly lighter gray (#2F3246)
- **Sidebar**: Dark theme (#1E1E2F)

### Responsive Design
- Mobile-friendly layout
- Collapsible sidebar
- Responsive charts and tables
- Touch-friendly interactions

### Error Handling UI
- **Alert Chips**: Color-coded error/success/warning alerts
- **Toast Notifications**: Non-intrusive success/error messages
- **Loading States**: Spinner animations during data loading
- **Empty States**: Helpful messages when no data is found

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**FinAnalyst** - Professional Financial Portfolio Management Platform
