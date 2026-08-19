const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

if (!process.env.VERCEL) {
  try {
    const dns = require('dns');
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  } catch (e) {
    // DNS override fallback
  }
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const insightRoutes = require('./routes/insightRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expenses', ocrRoutes);
app.use('/api/dashboard', insightRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'spendwise-api', time: new Date().toISOString() });
});

app.use((req, res, next) => {
  res.status(404).json({ message: `Endpoint ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
