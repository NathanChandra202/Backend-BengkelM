const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Bengkel Mouse API Docs',
  customCss: `
    .swagger-ui .topbar { background-color: #dc2626; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #dc2626; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const storeRoutes = require('./routes/storeRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/store', storeRoutes);

app.get('/', (req, res) => {
  res.send('Bengkel Mouse API is running');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
