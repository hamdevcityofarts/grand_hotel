const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  mockPaiement,
  processPayment,
  getPayments,
  getPaymentById,
  refundPayment,
  getPaymentStats
} = require('../controllers/paiementController');

/**
 * @swagger
 * tags:
 *   name: Paiements
 *   description: Gestion des paiements Cybersource
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Obtenir tous les paiements (Admin)
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/', protect, admin, getPayments);

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Statistiques des paiements (Admin)
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des paiements
 */
router.get('/stats', protect, admin, getPaymentStats);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Obtenir un paiement par ID
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Détails du paiement
 */
router.get('/:id', protect, getPaymentById);

/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     summary: Traiter un paiement Cybersource
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - paymentMethod
 *               - cardData
 *             properties:
 *               reservationId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, bank_transfer, mobile_money]
 *               cardData:
 *                 type: object
 *                 properties:
 *                   number:
 *                     type: string
 *                   expiry:
 *                     type: string
 *                   cvv:
 *                     type: string
 *                   holderName:
 *                     type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Paiement traité avec succès
 */
router.post('/process', protect, processPayment);

/**
 * @swagger
 * /api/payments/mock:
 *   post:
 *     summary: Simuler un paiement (développement)
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *             properties:
 *               reservationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paiement simulé avec succès
 */
router.post('/mock', protect, mockPaiement);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Rembourser un paiement
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Remboursement effectué
 */
router.post('/:id/refund', protect, admin, refundPayment);

module.exports = router;