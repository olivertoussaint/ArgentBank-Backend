const express = require('express');
const dotEnv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');
const dbConnection = require('./database/connection');
const apiRoutes = require('./routes');

dotEnv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to the database
dbConnection();

// Handle CORS issues
app.use(cors());

// Request payload middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1', apiRoutes);
console.log('API routes registered at /api/v1');

// Serve Swagger Editor
app.get('/editor', (req, res) => {
  res.redirect('https://editor.swagger.io/');
});

// Serve Swagger UI for API documentation
const swaggerDocs = yaml.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Argent Bank API!',
    availableEndpoints: ['/api/v1/accounts', '/api/v1/transactions', '/api-docs'],
  });
});

// Handle 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Middleware Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
