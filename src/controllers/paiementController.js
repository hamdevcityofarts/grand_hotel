const Reservation = require('../models/reservationModel');
const Payment = require('../models/Payment');
const { simulatePayment } = require('../config/cybersource');

// 🔹 Traiter un paiement Cybersource
exports.processPayment = async (req, res) => {
  try {
    const { reservationId, paymentMethod, cardData, amount } = req.body;

    console.log('💳 Début traitement paiement:', { reservationId, paymentMethod, amount });

    const reservation = await Reservation.findById(reservationId)
      .populate('client', 'email name surname')
      .populate('chambre', 'number name price');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && !reservation.client._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette réservation'
      });
    }

    // Déterminer le montant (acompte ou total)
    const paymentAmount = amount || (reservation.totalAmount / reservation.nights);
    const paymentType = amount === reservation.totalAmount ? 'full' : 'deposit';

    // 🔹 SIMULATION CYBERSOURCE
    const paymentResult = await simulatePayment(paymentAmount, 'EUR', {
      method: paymentMethod,
      cardData: cardData ? {
        ...cardData,
        number: cardData.number.replace(/\s/g, '') // Nettoyer le numéro
      } : null,
      clientEmail: reservation.client.email,
      clientName: `${reservation.client.name} ${reservation.client.surname}`,
      reservationId: reservation._id
    });

    console.log('✅ Résultat simulation Cybersource:', paymentResult);

    if (paymentResult.status !== 'AUTHORIZED') {
      return res.status(400).json({
        success: false,
        message: `Paiement refusé: ${paymentResult.message}`,
        declineReason: paymentResult.declineReason
      });
    }

    // 🔹 CRÉER L'ENREGISTREMENT DE PAIEMENT
    const payment = await Payment.create({
      reservation: reservationId,
      client: reservation.client._id,
      amount: paymentAmount,
      currency: 'EUR',
      type: paymentType,
      method: paymentMethod,
      status: 'completed',
      transactionId: paymentResult.transactionId,
      gateway: 'cybersource',
      gatewayResponse: paymentResult,
      cardLast4: cardData ? cardData.number.slice(-4) : null
    });

    // 🔹 METTRE À JOUR LA RÉSERVATION
    if (paymentType === 'deposit') {
      reservation.acompte = paymentAmount;
      reservation.status = 'confirmed';
    } else if (paymentType === 'full') {
      reservation.acompte = reservation.totalAmount;
      reservation.status = 'confirmed';
    }

    reservation.paiement = {
      amount: paymentAmount,
      paidAt: new Date(),
      method: paymentMethod,
      status: 'paid',
      transactionId: paymentResult.transactionId
    };

    await reservation.save();

    // 🔹 POPULER POUR LA RÉPONSE
    await payment.populate('client reservation');

    res.json({
      success: true,
      message: `Paiement ${paymentType === 'deposit' ? 'd\'acompte' : 'complet'} traité avec succès`,
      payment: {
        id: payment._id,
        amount: payment.amount,
        type: payment.type,
        transactionId: payment.transactionId,
        status: payment.status,
        method: payment.method,
        date: payment.createdAt
      },
      reservation: {
        id: reservation._id,
        status: reservation.status,
        acompte: reservation.acompte,
        totalAmount: reservation.totalAmount
      }
    });

  } catch (error) {
    console.error('❌ Erreur traitement paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du paiement',
      error: error.message
    });
  }
};

// 🔹 Simulation de paiement (développement)
exports.mockPaiement = async (req, res) => {
  try {
    const { reservationId, amount } = req.body;

    const reservation = await Reservation.findById(reservationId)
      .populate('client', 'email name surname')
      .populate('chambre', 'number name price');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && !reservation.client._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const paymentAmount = amount || (reservation.totalAmount / reservation.nights);
    const paymentType = amount === reservation.totalAmount ? 'full' : 'deposit';

    // Simulation
    const mockTransactionId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payment = await Payment.create({
      reservation: reservationId,
      client: reservation.client._id,
      amount: paymentAmount,
      currency: 'EUR',
      type: paymentType,
      method: 'card',
      status: 'completed',
      transactionId: mockTransactionId,
      gateway: 'mock',
      gatewayResponse: { status: 'AUTHORIZED', message: 'Paiement simulé' },
      cardLast4: '4242'
    });

    // Mettre à jour réservation
    if (paymentType === 'deposit') {
      reservation.acompte = paymentAmount;
    } else {
      reservation.acompte = reservation.totalAmount;
    }
    
    reservation.status = 'confirmed';
    reservation.paiement = {
      amount: paymentAmount,
      paidAt: new Date(),
      method: 'card',
      status: 'paid',
      transactionId: mockTransactionId
    };

    await reservation.save();
    await payment.populate('client reservation');

    console.log(`✅ Paiement simulé: ${paymentAmount}€ pour réservation ${reservationId}`);

    res.json({
      success: true,
      message: `Paiement ${paymentType === 'deposit' ? 'd\'acompte' : 'complet'} simulé avec succès`,
      payment: {
        id: payment._id,
        amount: payment.amount,
        type: payment.type,
        transactionId: payment.transactionId,
        status: payment.status,
        method: payment.method,
        date: payment.createdAt
      },
      reservation: {
        id: reservation._id,
        status: reservation.status,
        acompte: reservation.acompte,
        totalAmount: reservation.totalAmount
      }
    });

  } catch (error) {
    console.error('❌ Erreur simulation paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la simulation du paiement',
      error: error.message
    });
  }
};

// 🔹 Obtenir tous les paiements (Admin)
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('client', 'name surname email')
      .populate('reservation')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error('❌ Erreur récupération paiements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements',
      error: error.message
    });
  }
};

// 🔹 Obtenir un paiement par ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('client', 'name surname email phone')
      .populate('reservation')
      .populate({
        path: 'reservation',
        populate: { path: 'chambre', select: 'number name price' }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && !payment.client._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce paiement'
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('❌ Erreur récupération paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du paiement',
      error: error.message
    });
  }
};

// 🔹 Statistiques des paiements
exports.getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          averagePayment: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        overall: totalStats[0] || {}
      }
    });

  } catch (error) {
    console.error('❌ Erreur statistiques paiements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques',
      error: error.message
    });
  }
};

// 🔹 Remboursement
exports.refundPayment = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    const refundAmount = amount || payment.amount;
    
    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Le montant du remboursement ne peut pas dépasser le montant original'
      });
    }

    // Simuler remboursement Cybersource
    const refundResult = await simulatePayment(refundAmount, payment.currency, {
      type: 'refund',
      originalTransactionId: payment.transactionId
    });

    if (refundResult.status !== 'AUTHORIZED') {
      return res.status(400).json({
        success: false,
        message: `Remboursement refusé: ${refundResult.message}`
      });
    }

    // Créer enregistrement de remboursement
    const refund = await Payment.create({
      reservation: payment.reservation,
      client: payment.client,
      amount: -refundAmount,
      currency: payment.currency,
      type: 'refund',
      method: payment.method,
      status: 'completed',
      transactionId: refundResult.transactionId,
      gateway: 'cybersource',
      gatewayResponse: refundResult,
      refundOf: payment._id,
      reason: reason || 'Remboursement client'
    });

    // Mettre à jour paiement original
    payment.refundedAmount = (payment.refundedAmount || 0) + refundAmount;
    if (payment.refundedAmount >= payment.amount) {
      payment.status = 'refunded';
    } else {
      payment.status = 'partially_refunded';
    }
    
    await payment.save();

    res.json({
      success: true,
      message: `Remboursement de ${refundAmount}€ effectué avec succès`,
      refund: {
        id: refund._id,
        amount: refund.amount,
        transactionId: refund.transactionId
      },
      originalPayment: {
        id: payment._id,
        refundedAmount: payment.refundedAmount,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('❌ Erreur remboursement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du remboursement',
      error: error.message
    });
  }
};