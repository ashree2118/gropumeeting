import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true });
});
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
