import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const sampleTransactions = [
  // Income transactions
  {
    date: new Date('2024-01-15'),
    amount: 5000,
    category: 'Salary',
    status: 'completed',
    description: 'Monthly salary payment',
    type: 'income',
    paymentMethod: 'Bank Transfer',
    reference: 'SAL-2024-001',
    tags: ['salary', 'monthly']
  },
  {
    date: new Date('2024-01-20'),
    amount: 1200,
    category: 'Freelance',
    status: 'completed',
    description: 'Web development project',
    type: 'income',
    paymentMethod: 'PayPal',
    reference: 'FREELANCE-001',
    tags: ['freelance', 'development']
  },
  {
    date: new Date('2024-01-25'),
    amount: 500,
    category: 'Investment',
    status: 'completed',
    description: 'Stock dividend payment',
    type: 'income',
    paymentMethod: 'Bank Transfer',
    reference: 'DIV-2024-001',
    tags: ['dividend', 'investment']
  },
  {
    date: new Date('2024-01-30'),
    amount: 800,
    category: 'Rental',
    status: 'completed',
    description: 'Rental income from property',
    type: 'income',
    paymentMethod: 'Bank Transfer',
    reference: 'RENT-2024-001',
    tags: ['rental', 'property']
  },

  // Expense transactions
  {
    date: new Date('2024-01-01'),
    amount: 1200,
    category: 'Housing',
    status: 'completed',
    description: 'Monthly rent payment',
    type: 'expense',
    paymentMethod: 'Bank Transfer',
    reference: 'RENT-EXP-001',
    tags: ['rent', 'housing']
  },
  {
    date: new Date('2024-01-05'),
    amount: 150,
    category: 'Utilities',
    status: 'completed',
    description: 'Electricity bill',
    type: 'expense',
    paymentMethod: 'Credit Card',
    reference: 'UTIL-001',
    tags: ['electricity', 'utilities']
  },
  {
    date: new Date('2024-01-10'),
    amount: 80,
    category: 'Food & Dining',
    status: 'completed',
    description: 'Grocery shopping',
    type: 'expense',
    paymentMethod: 'Debit Card',
    reference: 'FOOD-001',
    tags: ['groceries', 'food']
  },
  {
    date: new Date('2024-01-12'),
    amount: 45,
    category: 'Transportation',
    status: 'completed',
    description: 'Gas station',
    type: 'expense',
    paymentMethod: 'Credit Card',
    reference: 'TRANS-001',
    tags: ['gas', 'transportation']
  },
  {
    date: new Date('2024-01-15'),
    amount: 200,
    category: 'Healthcare',
    status: 'completed',
    description: 'Doctor appointment',
    type: 'expense',
    paymentMethod: 'Credit Card',
    reference: 'HEALTH-001',
    tags: ['healthcare', 'medical']
  },
  {
    date: new Date('2024-01-18'),
    amount: 120,
    category: 'Entertainment',
    status: 'completed',
    description: 'Movie tickets and dinner',
    type: 'expense',
    paymentMethod: 'Credit Card',
    reference: 'ENT-001',
    tags: ['entertainment', 'dining']
  },
  {
    date: new Date('2024-01-22'),
    amount: 300,
    category: 'Shopping',
    status: 'completed',
    description: 'New clothes',
    type: 'expense',
    paymentMethod: 'Credit Card',
    reference: 'SHOP-001',
    tags: ['clothing', 'shopping']
  },
  {
    date: new Date('2024-01-25'),
    amount: 100,
    category: 'Education',
    status: 'completed',
    description: 'Online course subscription',
    type: 'expense',
    paymentMethod: 'Credit Card',
    reference: 'EDU-001',
    tags: ['education', 'online']
  },
  {
    date: new Date('2024-01-28'),
    amount: 250,
    category: 'Insurance',
    status: 'completed',
    description: 'Car insurance premium',
    type: 'expense',
    paymentMethod: 'Bank Transfer',
    reference: 'INS-001',
    tags: ['insurance', 'car']
  },

  // February transactions
  {
    date: new Date('2024-02-01'),
    amount: 1200,
    category: 'Housing',
    status: 'completed',
    description: 'Monthly rent payment',
    type: 'expense',
    paymentMethod: 'Bank Transfer',
    reference: 'RENT-EXP-002',
    tags: ['rent', 'housing']
  },
  {
    date: new Date('2024-02-15'),
    amount: 5000,
    category: 'Salary',
    status: 'completed',
    description: 'Monthly salary payment',
    type: 'income',
    paymentMethod: 'Bank Transfer',
    reference: 'SAL-2024-002',
    tags: ['salary', 'monthly']
  },
  {
    date: new Date('2024-02-20'),
    amount: 1800,
    category: 'Freelance',
    status: 'completed',
    description: 'Mobile app development project',
    type: 'income',
    paymentMethod: 'PayPal',
    reference: 'FREELANCE-002',
    tags: ['freelance', 'development']
  },
  {
    date: new Date('2024-02-25'),
    amount: 600,
    category: 'Investment',
    status: 'completed',
    description: 'Stock dividend payment',
    type: 'income',
    paymentMethod: 'Bank Transfer',
    reference: 'DIV-2024-002',
    tags: ['dividend', 'investment']
  },

  // March transactions
  {
    date: new Date('2024-03-01'),
    amount: 1200,
    category: 'Housing',
    status: 'completed',
    description: 'Monthly rent payment',
    type: 'expense',
    paymentMethod: 'Bank Transfer',
    reference: 'RENT-EXP-003',
    tags: ['rent', 'housing']
  },
  {
    date: new Date('2024-03-15'),
    amount: 5000,
    category: 'Salary',
    status: 'completed',
    description: 'Monthly salary payment',
    type: 'income',
    paymentMethod: 'Bank Transfer',
    reference: 'SAL-2024-003',
    tags: ['salary', 'monthly']
  },
  {
    date: new Date('2024-03-20'),
    amount: 900,
    category: 'Freelance',
    status: 'completed',
    description: 'Website maintenance',
    type: 'income',
    paymentMethod: 'PayPal',
    reference: 'FREELANCE-003',
    tags: ['freelance', 'maintenance']
  },
  {
    date: new Date('2024-03-25'),
    amount: 400,
    category: 'Investment',
    status: 'completed',
    description: 'Stock dividend payment',
    type: 'income',
    paymentMethod: 'Bank Transfer',
    reference: 'DIV-2024-003',
    tags: ['dividend', 'investment']
  }
];

export const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Create a test user if it doesn't exist
    const existingUser = await User.findOne({ email: 'test@finanalyst.com' });
    let userId;

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user = await User.create({
        email: 'test@finanalyst.com',
        password: hashedPassword,
        name: 'Pranav Palekar',
        role: 'user'
      });
      userId = user._id;
      console.log('✅ Test user created');
    } else {
      userId = existingUser._id;
      console.log('✅ Test user already exists');
    }

    // Clear ALL existing transactions to avoid id conflicts
    await Transaction.deleteMany({});
    console.log('🗑️ Cleared all existing transactions');

    // Create transactions with the user_id and id fields
    const transactionsWithUserId = sampleTransactions.map((transaction, idx) => ({
      ...transaction,
      user_id: userId,
      id: idx + 1
    }));

    await Transaction.insertMany(transactionsWithUserId);
    console.log(`✅ Created ${sampleTransactions.length} sample transactions`);

    console.log('🎉 Data seeding completed successfully!');
    console.log('📧 Test user email: test@finanalyst.com');
    console.log('🔑 Test user password: password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  import('../config/database').then(({ connectDatabase }) => {
    connectDatabase()
      .then(() => seedData())
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Failed to seed data:', error);
        process.exit(1);
      });
  });
} 