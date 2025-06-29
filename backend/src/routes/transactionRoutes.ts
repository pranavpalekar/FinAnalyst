import express from 'express';
import {
  getTransactions,
  getTransaction,
  getTransactionStats,
  getAvailableFilters,
  getDashboardOverview,
  getCSVConfigOptions,
  exportToCSV
} from '../controllers/transactionController';

const router = express.Router();

// Transaction routes
router.get('/', getTransactions);
router.get('/stats', getTransactionStats);
router.get('/filters', getAvailableFilters);
router.get('/dashboard', getDashboardOverview);
router.get('/csv-config', getCSVConfigOptions);
router.get('/:id', getTransaction);

// CSV export route
router.post('/export-csv', exportToCSV);

export default router; 