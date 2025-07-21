import cors from 'cors';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/test-db', (req, res) => {
  res.json({ message: 'Database connection test endpoint' });
});

app.get('/api/reading-records', (req, res) => {
  res.json({ message: 'Get reading records endpoint' });
});

app.post('/api/reading-records', (req, res) => {
  res.json({ message: 'Create reading record endpoint', data: req.body });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
