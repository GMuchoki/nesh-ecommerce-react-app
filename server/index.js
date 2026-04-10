import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Modular Routes
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Essential Middleware
app.use(cors());
app.use(express.json());

// API Domain Routers (MVC Architecture)
app.use('/api/admin', adminRoutes);
app.use('/api', paymentRoutes); 

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Structure Exception:", err);
    res.status(500).json({ error: "Internal System Architecture Failure" });
});

// Boot Sequence
app.listen(PORT, () => {
  console.log(`Enterprise MVC Node Server securely operating actively on port ${PORT}`);
});
