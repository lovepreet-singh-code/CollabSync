import express from 'express';
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
});