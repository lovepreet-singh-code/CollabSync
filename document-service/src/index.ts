import mongoose from 'mongoose';
import app from './app';
import { PORT, MONGO_URI } from './config';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Document service running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });