import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  id: number;
  date: Date;
  amount: number;
  category: string;
  status: string;
  user_id: string;
}

export interface ITransactionModel extends mongoose.Model<ITransaction> {
  getStats(userId?: string): Promise<any>;
  getCategoryBreakdown(userId?: string, type?: string): Promise<any>;
}

const transactionSchema = new Schema<ITransaction>({
  id: { type: Number, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  status: { type: String, required: true },
  user_id: { type: String, required: true }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ user_id: 1, date: -1 });
transactionSchema.index({ user_id: 1, category: 1 });
transactionSchema.index({ user_id: 1, status: 1 });

// Static method to get transaction statistics
transactionSchema.statics.getStats = async function(userId?: string) {
  const matchFilter: any = {};
  if (userId) {
    matchFilter.user_id = userId;
  }

  const stats = await this.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalTransactions: 0,
      totalAmount: 0,
      avgAmount: 0,
      minAmount: 0,
      maxAmount: 0
    };
  }

  return stats[0];
};

// Static method to get category breakdown
transactionSchema.statics.getCategoryBreakdown = async function(userId?: string, type?: string) {
  const matchFilter: any = {};
  if (userId) {
    matchFilter.user_id = userId;
  }
  if (type) {
    matchFilter.category = type;
  }

  const breakdown = await this.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        total: { $sum: '$amount' },
        avg: { $avg: '$amount' }
      }
    },
    { $sort: { total: -1 } }
  ]);

  return breakdown;
};

export const Transaction = mongoose.model<ITransaction, ITransactionModel>('Transaction', transactionSchema); 