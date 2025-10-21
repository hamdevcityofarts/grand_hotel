// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Références
  reservation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reservation', 
    required: true 
  },
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Informations de paiement
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'EUR' 
  },
  type: { 
    type: String, 
    enum: ['deposit', 'full', 'refund'], 
    required: true 
  },
  method: { 
    type: String, 
    enum: ['card', 'bank_transfer', 'mobile_money', 'cash'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'], 
    default: 'pending' 
  },
  
  // Informations de transaction
  transactionId: { 
    type: String, 
    unique: true 
  },
  gateway: { 
    type: String, 
    enum: ['cybersource', 'mock'], 
    default: 'mock' 
  },
  gatewayResponse: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
  // Informations carte (si applicable)
  cardLast4: { 
    type: String 
  },
  cardBrand: { 
    type: String 
  },
  
  // Remboursement
  refundOf: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Payment' 
  },
  refundedAmount: { 
    type: Number, 
    default: 0 
  },
  reason: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// Index pour performances
paymentSchema.index({ reservation: 1 });
paymentSchema.index({ client: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);