const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

// Configuration environment
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅✅✅ ROUTES AVEC ANCIENNE STRUCTURE QUI MARCHAIT ✅✅✅
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chambres', require('./routes/chambreRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/payments', require('./routes/paiementRoutes'));
app.use('/api/utilisateurs', require('./routes/userRoutes'));

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Grand Hotel',
      version: '1.0.0',
      description: 'API pour la gestion de l\'hôtel Grand Hotel',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
  },
  apis: [path.join(__dirname, 'routes', '*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Grand Hotel fonctionne!' });
});

app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API Grand Hotel',
    endpoints: {
      auth: '/api/auth',
      chambres: '/api/chambres', 
      reservations: '/api/reservations',
      documentation: '/api-docs'
    }
  });
});

// Connexion MongoDB et démarrage
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grandhotel');
    console.log('✅ Connecté à MongoDB');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📚 Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔐 Test auth: http://localhost:${PORT}/api/auth/login`);
    });

  } catch (error) {
    console.error('❌ Erreur démarrage:', error);
    process.exit(1);
  }
};

startServer();