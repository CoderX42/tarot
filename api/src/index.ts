import express from 'express';
import cors from 'cors';
import tarotRoutes from './routes/tarot.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Tarot routes
app.use('/api/tarot', tarotRoutes);

app.listen(PORT, () => {
  console.log(`Tarot API server is running on port ${PORT}`);
});