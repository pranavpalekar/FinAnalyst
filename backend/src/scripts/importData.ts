import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Transaction } from '../models/Transaction';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finanalyst';

const importTransactions = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Clear existing data
    await Transaction.deleteMany({});
    console.log('✅ Cleared existing transactions');
    
    // Read transactions data from the root transactions.json file
    const dataPath = path.join(__dirname, '../../../transactions.json');
    const transactionsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Transform data to match our schema - keep original user_id values
    const transactions = transactionsData.map((transaction: any) => ({
      id: transaction.id,
      date: new Date(transaction.date),
      amount: transaction.amount,
      category: transaction.category,
      status: transaction.status,
      user_id: transaction.user_id, // Keep original user_id values
      user_profile: transaction.user_profile
    }));
    
    // Insert transactions
    const result = await Transaction.insertMany(transactions);
    console.log(`✅ Successfully imported ${result.length} transactions from transactions.json`);
    
    // Display some stats
    const stats = await Transaction.getStats('user_001');
    console.log('📊 Import Stats:', stats);
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Run the import
importTransactions(); 