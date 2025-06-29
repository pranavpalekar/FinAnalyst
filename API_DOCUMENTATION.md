# 📚 FinAnalyst API Documentation

Complete API documentation for the Financial Analytics Dashboard application.

## 🔗 Base URL
```
http://localhost:5000
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📋 Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "demo@finanalyst.com",
  "password": "demo123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "name": "Pranav Palekar",
      "email": "demo@finanalyst.com"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "statusCode": 401
}
```

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "2",
      "name": "New User",
      "email": "newuser@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/auth/profile
Get current user profile (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "Pranav Palekar",
      "email": "demo@finanalyst.com"
    }
  }
}
```

### Transaction Endpoints

#### GET /api/transactions
Get all transactions with filtering, sorting, and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 1000)
- `sortBy` (string): Sort field (date, amount, category, status, user_id)
- `sortOrder` (string): Sort direction (asc, desc)
- `category` (string): Filter by category
- `status` (string): Filter by status
- `dateFrom` (string): Start date (YYYY-MM-DD)
- `dateTo` (string): End date (YYYY-MM-DD)
- `amountMin` (number): Minimum amount
- `amountMax` (number): Maximum amount
- `search` (string): Search term

**Example Request:**
```
GET /api/transactions?page=1&limit=10&sortBy=date&sortOrder=desc&category=Revenue&dateFrom=2024-01-01&dateTo=2024-12-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "date": "2024-06-15T00:00:00.000Z",
        "amount": 1500.00,
        "category": "Revenue",
        "status": "Paid",
        "user_id": "user123",
        "user_profile": "https://example.com/profile.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

#### GET /api/transactions/:id
Get a specific transaction by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": 1,
      "date": "2024-06-15T00:00:00.000Z",
      "amount": 1500.00,
      "category": "Revenue",
      "status": "Paid",
      "user_id": "user123",
      "user_profile": "https://example.com/profile.jpg"
    }
  }
}
```

#### POST /api/transactions
Create a new transaction.

**Request Body:**
```json
{
  "amount": 1500.00,
  "category": "Revenue",
  "date": "2024-06-15",
  "status": "Paid",
  "user_id": "user123",
  "user_profile": "https://example.com/profile.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": 1,
      "amount": 1500.00,
      "category": "Revenue",
      "date": "2024-06-15T00:00:00.000Z",
      "status": "Paid",
      "user_id": "user123",
      "user_profile": "https://example.com/profile.jpg"
    }
  }
}
```

#### PUT /api/transactions/:id
Update an existing transaction.

**Request Body:**
```json
{
  "amount": 1600.00,
  "category": "Revenue",
  "date": "2024-06-15",
  "status": "Paid",
  "user_id": "user123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "transaction": {
      "id": 1,
      "amount": 1600.00,
      "category": "Revenue",
      "date": "2024-06-15T00:00:00.000Z",
      "status": "Paid",
      "user_id": "user123"
    }
  }
}
```

#### DELETE /api/transactions/:id
Delete a transaction.

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

### CSV Export Endpoint

#### POST /api/transactions/export-csv
Export transactions to CSV with proper headers and formatting.

**Request Body:**
```json
{
  "config": {
    "columns": ["date", "amount", "category", "status"],
    "includeHeaders": true
  },
  "filters": {
    "category": "Revenue",
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31",
    "searchTerm": "payment"
  }
}
```

**Response (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=transactions.csv

"Date","Amount","Category","Status"
"Jan 15, 2024","$1,500.00","Revenue","Paid"
"Jan 20, 2024","$2,300.00","Revenue","Paid"
"Feb 01, 2024","$800.00","Expense","Pending"
```

### Analytics Endpoints

#### GET /api/analytics/summary
Get financial summary statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 50000.00,
    "totalExpenses": 30000.00,
    "netBalance": 20000.00,
    "profitMargin": 40.0,
    "transactionCount": 150
  }
}
```

#### GET /api/analytics/trends
Get monthly revenue vs expenses trends.

**Query Parameters:**
- `year` (number): Year for trends (default: current year)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "month": "Jan",
      "revenue": 5000.00,
      "expenses": 3000.00,
      "profit": 2000.00
    },
    {
      "month": "Feb",
      "revenue": 6000.00,
      "expenses": 3500.00,
      "profit": 2500.00
    }
  ]
}
```

#### GET /api/analytics/categories
Get category breakdown for charts.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "user123 (Revenue)",
      "value": 25000.00,
      "type": "Revenue"
    },
    {
      "name": "user456 (Expense)",
      "value": 15000.00,
      "type": "Expense"
    }
  ]
}
```

#### GET /api/analytics/growth
Get month-over-month growth rates.

**Query Parameters:**
- `year` (number): Year for growth data (default: current year)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "month": "Jan",
      "revenueGrowth": 0,
      "expenseGrowth": 0,
      "profitGrowth": 0
    },
    {
      "month": "Feb",
      "revenueGrowth": 20.0,
      "expenseGrowth": 16.7,
      "profitGrowth": 25.0
    }
  ]
}
```

### Health Check Endpoints

#### GET /health
Check if the API server is running.

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-06-15T10:30:00.000Z",
  "uptime": 3600
}
```

#### GET /api/status
Get detailed API status information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "environment": "development",
    "database": "connected",
    "timestamp": "2024-06-15T10:30:00.000Z"
  }
}
```

## 🚨 Error Handling

### Error Response Format
All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message description",
  "statusCode": 400
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid or missing token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **422**: Validation Error - Invalid data format
- **500**: Internal Server Error - Server error

### Error Types

#### Authentication Errors
```json
{
  "success": false,
  "error": "Invalid token",
  "statusCode": 401
}
```

#### Validation Errors
```json
{
  "success": false,
  "error": "Amount must be a positive number",
  "statusCode": 400
}
```

#### Database Errors
```json
{
  "success": false,
  "error": "Resource not found",
  "statusCode": 404
}
```

#### Server Errors
```json
{
  "success": false,
  "error": "Internal server error",
  "statusCode": 500
}
```

## 📊 Data Models

### Transaction Model
```typescript
interface Transaction {
  id: number;
  date: Date;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile?: string;
}
```

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### CSV Export Configuration
```typescript
interface CSVConfig {
  columns: string[];
  includeHeaders: boolean;
}

interface ExportFilters {
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  searchTerm?: string;
}
```

## 🔧 Request Examples

### Using cURL

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@finanalyst.com",
    "password": "demo123"
  }'
```

#### Get Transactions
```bash
curl -X GET "http://localhost:5000/api/transactions?page=1&limit=10&category=Revenue" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Export CSV
```bash
curl -X POST http://localhost:5000/api/transactions/export-csv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "columns": ["date", "amount", "category", "status"],
      "includeHeaders": true
    },
    "filters": {
      "category": "Revenue"
    }
  }' \
  --output transactions.csv
```

### Using JavaScript/Fetch

#### Login
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'demo@finanalyst.com',
    password: 'demo123'
  })
});

const data = await response.json();
const token = data.data.token;
```

#### Get Transactions
```javascript
const response = await fetch('http://localhost:5000/api/transactions?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
```

#### Export CSV
```javascript
const response = await fetch('http://localhost:5000/api/transactions/export-csv', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    config: {
      columns: ['date', 'amount', 'category', 'status'],
      includeHeaders: true
    },
    filters: {
      category: 'Revenue'
    }
  })
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'transactions.csv';
a.click();
```

## 📋 Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Transaction endpoints**: 100 requests per minute
- **Analytics endpoints**: 50 requests per minute
- **Export endpoints**: 10 requests per minute

## 🔒 Security

- **JWT Tokens**: All protected endpoints require valid JWT tokens
- **Password Hashing**: Passwords are hashed using bcrypt
- **Input Validation**: All inputs are validated and sanitized
- **CORS**: Cross-origin requests are properly configured
- **Helmet**: Security headers are automatically added

## 📝 Notes

- All dates are returned in ISO 8601 format
- Amounts are returned as numbers (not strings)
- CSV exports include proper headers and formatting
- Error responses include appropriate HTTP status codes
- Authentication tokens expire after 7 days by default

---

For testing, use the included Postman collection: `Finanalyst_API_Postman_Collection.json` 