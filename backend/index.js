import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());
app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Meetrix Groups API is running!' });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});