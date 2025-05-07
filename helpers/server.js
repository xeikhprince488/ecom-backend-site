const express = require('express');
const cors = require('cors');
const paymentRoutes = require('../routes/shop/paymentRoutes');

const app = express();

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ecom.papgen.online',
    'https://ecom-site-beta.vercel.app',
    'https://ecom-site-beta.vercel.app/',
    'https://ecom-site-j99g.vercel.app',
    'https://ecom-site-j99g.vercel.app/',
    'https://grocery-hub-desktop-application-2mblf5xur.vercel.app' // Add your frontend Vercel URL
  ],
  credentials: true,
}));

// Middleware for JSON parsing
app.use(express.json());

// Handle Preflight Requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', [
        'http://localhost:5173',
        'https://ecom.papgen.online',
        'https://ecom-site-j99g.vercel.app',
        'https://ecom-site-beta.vercel.app',
        'https://grocery-hub-desktop-application-2mblf5xur.vercel.app' // Add your frontend Vercel URL
    ].join(', '));
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204); // No Content
});

// API Routes
app.use('/api', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
