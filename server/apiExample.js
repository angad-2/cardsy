import express from 'express';
import { add } from './engineWrapper.js';

const app = express();
app.use(express.json());

// Endpoint to add two numbers
app.post('/api/add', (req, res) => {
  const { a, b } = req.body;
  
  if (a === undefined || b === undefined) {
    return res.status(400).json({ error: 'Missing a or b parameter' });
  }
  
  try {
    const result = add(a, b);
    res.json({ a, b, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`POST http://localhost:${PORT}/api/add with { "a": 5, "b": 3 }`);
});
