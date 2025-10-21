// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

exports.protect = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Non autorisé, aucun token fourni' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token invalide: ID utilisateur manquant' });
    }

    req.user = await User.findById(userId).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    }

    // Allow non-actif access to login/profile? For protected routes, require actif:
    if (req.user.status !== 'actif') {
      return res.status(403).json({ success: false, message: 'Compte non actif. Contactez un administrateur.' });
    }

    // update lastLogin for activity (save)
    req.user.lastLogin = new Date();
    await req.user.save();

    next();
  } catch (err) {
    console.error('Erreur token:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expiré' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token invalide' });
    }
    return res.status(401).json({ success: false, message: 'Erreur d\'authentification' });
  }
};

// Roles & permissions middlewares (exported as named exports)
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Non authentifié' });
  if (roles.includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: `Accès réservé aux rôles: ${roles.join(', ')}` });
};

exports.requirePermission = (...permissions) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Non authentifié' });
  const hasAll = permissions.every(p => req.user.permissions.includes(p));
  if (hasAll) return next();
  return res.status(403).json({ success: false, message: `Permission(s) requise(s): ${permissions.join(', ')}` });
};
